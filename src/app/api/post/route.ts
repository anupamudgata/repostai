import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto/tokens";
import { postToTwitter } from "@/lib/social/post";
import type { Platform } from "@/types";

/** Map repurpose platform to connected_account provider */
function platformToProvider(platform: Platform): "twitter" | "linkedin" | null {
  if (platform === "twitter_thread" || platform === "twitter_single") return "twitter";
  if (platform === "linkedin") return "linkedin";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const jobId = body.jobId as string | undefined;
    const platform = body.platform as Platform | undefined;
    const connectedAccountId = body.connectedAccountId as string | undefined;

    if (!jobId || !platform || !connectedAccountId) {
      return NextResponse.json(
        { error: "Missing jobId, platform, or connectedAccountId" },
        { status: 400 }
      );
    }

    const provider = platformToProvider(platform);
    if (!provider) {
      return NextResponse.json(
        { error: "Posting not supported for this platform" },
        { status: 400 }
      );
    }

    // Get output content (job must belong to user)
    const { data: output, error: outputError } = await supabase
      .from("repurpose_outputs")
      .select("id, generated_content, edited_content")
      .eq("job_id", jobId)
      .eq("platform", platform)
      .single();

    if (outputError || !output) {
      return NextResponse.json(
        { error: "Output not found or not yours" },
        { status: 404 }
      );
    }

    const { data: job } = await supabase
      .from("repurpose_jobs")
      .select("id")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not yours" },
        { status: 404 }
      );
    }

    const { data: account, error: accountError } = await supabase
      .from("connected_accounts")
      .select("id, provider, encrypted_access_token")
      .eq("id", connectedAccountId)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account || account.provider !== provider) {
      return NextResponse.json(
        { error: "Connected account not found or wrong platform" },
        { status: 404 }
      );
    }

    const content =
      (output.edited_content ?? output.generated_content)?.trim() || "";
    if (!content) {
      return NextResponse.json(
        { error: "No content to post" },
        { status: 400 }
      );
    }

    let accessToken: string;
    try {
      accessToken = decrypt(account.encrypted_access_token);
    } catch {
      return NextResponse.json(
        { error: "Could not use saved credentials. Reconnect the account." },
        { status: 500 }
      );
    }

    if (provider === "twitter") {
      try {
        await postToTwitter(content, accessToken);
        return NextResponse.json({ success: true });
      } catch (e) {
        console.error("Twitter post failed:", e);
        return NextResponse.json(
          { error: "Failed to post to X. Try reconnecting the account." },
          { status: 502 }
        );
      }
    }

    if (provider === "linkedin") {
      return NextResponse.json(
        { error: "LinkedIn posting not yet implemented" },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: "Unsupported provider" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Post API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
