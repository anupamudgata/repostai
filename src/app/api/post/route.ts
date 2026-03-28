import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postToTwitterWithToken } from "@/lib/social/posters/twitter";
import { postToLinkedIn } from "@/lib/social/posters/linkedin";
import { decrypt } from "@/lib/crypto/tokens";
import type { Platform } from "@/types";

/** Map repurpose platform to connected_account platform */
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
      .select("id, platform, access_token")
      .eq("id", connectedAccountId)
      .eq("user_id", user.id)
      .single();

    if (accountError || !account || account.platform !== provider) {
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

    /** Decrypt access token — handles both encrypted (new) and plaintext (legacy) values. */
    let decryptedToken: string;
    try {
      decryptedToken = decrypt(account.access_token);
    } catch {
      decryptedToken = account.access_token; // legacy plaintext
    }

    if (provider === "twitter") {
      try {
        await postToTwitterWithToken(content, decryptedToken);
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
      try {
        const result = await postToLinkedIn(user.id, content);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error ?? "Failed to post to LinkedIn" },
            { status: 502 }
          );
        }
        return NextResponse.json({ success: true });
      } catch (e) {
        console.error("LinkedIn post failed:", e);
        return NextResponse.json(
          { error: "Failed to post to LinkedIn. Try reconnecting the account." },
          { status: 502 }
        );
      }
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
