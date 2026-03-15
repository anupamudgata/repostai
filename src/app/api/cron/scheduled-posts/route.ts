import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { postToTwitterWithToken } from "@/lib/social/posters/twitter";
import { postToLinkedIn } from "@/lib/social/posters/linkedin";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/** Run via Vercel Cron (every minute) or manually: GET /api/cron/scheduled-posts?secret=CRON_SECRET or Authorization: Bearer CRON_SECRET */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const querySecret = new URL(request.url).searchParams.get("secret");
    if (bearer !== secret && querySecret !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date().toISOString();

  const { data: pending, error: fetchError } = await supabaseAdmin
    .from("scheduled_posts")
    .select("id, output_id, connected_account_id, platform, user_id")
    .eq("status", "pending")
    .lte("scheduled_at", now);

  if (fetchError) {
    console.error("Cron scheduled-posts fetch error:", fetchError);
    return NextResponse.json(
      { error: "Failed to fetch pending posts" },
      { status: 500 }
    );
  }

  if (!pending?.length) {
    return NextResponse.json({ processed: 0 });
  }

  let processed = 0;
  for (const row of pending) {
    try {
      const { data: output } = await supabaseAdmin
        .from("repurpose_outputs")
        .select("generated_content, edited_content")
        .eq("id", row.output_id)
        .single();

      const content =
        (output?.edited_content ?? output?.generated_content)?.trim() || "";
      if (!content) {
        await supabaseAdmin
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: "No content",
            posted_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        processed++;
        continue;
      }

      const { data: account } = await supabaseAdmin
        .from("connected_accounts")
        .select("platform, access_token, user_id")
        .eq("id", row.connected_account_id)
        .single();

      if (!account) {
        await supabaseAdmin
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: "Connected account not found",
            posted_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        processed++;
        continue;
      }

      if (account.platform === "twitter") {
        try {
          await postToTwitterWithToken(content, account.access_token);
          await supabaseAdmin
            .from("scheduled_posts")
            .update({
              status: "completed",
              posted_at: new Date().toISOString(),
            })
            .eq("id", row.id);
        } catch (e) {
          console.error("Cron post failed for scheduled_posts id:", row.id, e);
          await supabaseAdmin
            .from("scheduled_posts")
            .update({
              status: "failed",
              error_message: String(e instanceof Error ? e.message : e),
              posted_at: new Date().toISOString(),
            })
            .eq("id", row.id);
        }
        processed++;
      } else if (account.platform === "linkedin") {
        try {
          const result = await postToLinkedIn(account.user_id, content);
          if (result.success) {
            await supabaseAdmin
              .from("scheduled_posts")
              .update({
                status: "completed",
                posted_at: new Date().toISOString(),
              })
              .eq("id", row.id);
          } else {
            await supabaseAdmin
              .from("scheduled_posts")
              .update({
                status: "failed",
                error_message: result.error ?? "LinkedIn post failed",
                posted_at: new Date().toISOString(),
              })
              .eq("id", row.id);
          }
        } catch (e) {
          console.error("Cron LinkedIn post failed for scheduled_posts id:", row.id, e);
          await supabaseAdmin
            .from("scheduled_posts")
            .update({
              status: "failed",
              error_message: String(e instanceof Error ? e.message : e),
              posted_at: new Date().toISOString(),
            })
            .eq("id", row.id);
        }
        processed++;
      } else {
        await supabaseAdmin
          .from("scheduled_posts")
          .update({
            status: "failed",
            error_message: "Unsupported platform",
            posted_at: new Date().toISOString(),
          })
          .eq("id", row.id);
        processed++;
      }
    } catch (e) {
      console.error("Cron scheduled-posts row error:", row.id, e);
      await supabaseAdmin
        .from("scheduled_posts")
        .update({
          status: "failed",
          error_message: String(e instanceof Error ? e.message : e),
          posted_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      processed++;
    }
  }

  return NextResponse.json({ processed });
}
