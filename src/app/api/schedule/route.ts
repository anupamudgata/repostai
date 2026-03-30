import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Platform } from "@/types";

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
    const scheduledAt = body.scheduledAt as string | undefined; // ISO date-time

    if (!jobId || !platform || !connectedAccountId || !scheduledAt) {
      return NextResponse.json(
        { error: "Missing jobId, platform, connectedAccountId, or scheduledAt" },
        { status: 400 }
      );
    }

    const provider = platformToProvider(platform);
    if (!provider) {
      return NextResponse.json(
        { error: "Scheduling not supported for this platform" },
        { status: 400 }
      );
    }

    const at = new Date(scheduledAt);
    if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "scheduledAt must be a future date/time" },
        { status: 400 }
      );
    }

    // Ensure job belongs to user
    const { data: job } = await supabase
      .from("repurpose_jobs")
      .select("id")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or not yours" },
        { status: 404 }
      );
    }

    // Get output id for this job + platform
    const { data: output, error: outputError } = await supabase
      .from("repurpose_outputs")
      .select("id")
      .eq("job_id", jobId)
      .eq("platform", platform)
      .maybeSingle();

    if (outputError || !output) {
      return NextResponse.json(
        { error: "Output not found for this job and platform" },
        { status: 404 }
      );
    }

    // Ensure connected account belongs to user and matches platform
    const { data: account, error: accountError } = await supabase
      .from("connected_accounts")
      .select("id, platform")
      .eq("id", connectedAccountId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (accountError || !account || account.platform !== provider) {
      return NextResponse.json(
        { error: "Connected account not found or wrong platform" },
        { status: 404 }
      );
    }

    const { data: scheduled, error: insertError } = await supabase
      .from("scheduled_posts")
      .insert({
        user_id: user.id,
        connected_account_id: connectedAccountId,
        output_id: output.id,
        platform,
        scheduled_at: at.toISOString(),
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Schedule insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to schedule post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: scheduled?.id });
  } catch (error) {
    console.error("Schedule API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
