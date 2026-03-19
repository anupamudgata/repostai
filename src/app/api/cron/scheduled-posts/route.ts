// src/app/api/cron/scheduled-posts/route.ts
// FIXED: Added proper error handling so a crash here doesn't affect the landing page
// Also fixed the missing segments assignment and else block from your commit history

import { NextRequest, NextResponse } from "next/server";

// Lazy imports — don't import at top level to avoid build-time crashes
async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/lib/supabase/admin");
  return supabaseAdmin;
}

export const dynamic    = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  // Verify this is a legitimate Vercel cron request
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = await getSupabaseAdmin();
    const now           = new Date().toISOString();

    // Fetch all scheduled posts that are due
    const { data: posts, error: fetchError } = await supabaseAdmin
      .from("scheduled_posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .limit(50);

    if (fetchError) {
      console.error("[cron] Failed to fetch scheduled posts:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: fetchError.message },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        message:  "No posts due for publishing",
      });
    }

    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const post of posts) {
      try {
        // Mark as processing to prevent double-publish
        await supabaseAdmin
          .from("scheduled_posts")
          .update({ status: "processing", updated_at: new Date().toISOString() })
          .eq("id", post.id);

        // Process each platform in the post
        const platforms: string[] = post.platforms ?? [];
        const segments: Record<string, string> = post.content_segments ?? {};

        let publishedCount = 0;

        for (const platform of platforms) {
          const content = segments[platform] ?? post.content ?? "";

          if (!content) {
            console.warn(`[cron] No content for platform ${platform} on post ${post.id}`);
            continue;
          }

          try {
            // Dynamic import of social poster to avoid top-level build crashes
            if (platform === "linkedin") {
              const { postToLinkedIn } = await import("@/lib/social/posters/linkedin");
              await postToLinkedIn(post.user_id, content);
              publishedCount++;
            } else if (platform === "twitter" || platform === "twitter_single") {
              const { postToTwitter } = await import("@/lib/social/posters/twitter");
              await postToTwitter(post.user_id, content);
              publishedCount++;
            } else if (platform === "facebook") {
              const { postToFacebook } = await import("@/lib/social/posters/facebook");
              await postToFacebook(post.user_id, content);
              publishedCount++;
            } else if (platform === "reddit") {
              const { postToReddit } = await import("@/lib/social/posters/reddit");
              const subreddit = post.subreddit ?? "entrepreneur";
              await postToReddit(post.user_id, content, subreddit);
              publishedCount++;
            } else {
              console.log(`[cron] Platform ${platform} not yet supported for auto-posting`);
            }
          } catch (platformErr) {
            const msg = platformErr instanceof Error
              ? platformErr.message
              : "Unknown platform error";
            console.error(`[cron] Failed to post to ${platform} for post ${post.id}:`, msg);
            results.errors.push(`${post.id}/${platform}: ${msg}`);
          }
        }

        // Mark as published or failed based on results
        const finalStatus = publishedCount > 0 ? "published" : "failed";

        await supabaseAdmin
          .from("scheduled_posts")
          .update({
            status:       finalStatus,
            published_at: publishedCount > 0 ? new Date().toISOString() : null,
            updated_at:   new Date().toISOString(),
          })
          .eq("id", post.id);

        if (publishedCount > 0) {
          results.success++;
        } else {
          results.failed++;
        }

      } catch (postErr) {
        const msg = postErr instanceof Error ? postErr.message : "Unknown error";
        console.error(`[cron] Failed to process post ${post.id}:`, msg);
        results.errors.push(`${post.id}: ${msg}`);
        results.failed++;

        // Mark as failed so it doesn't get stuck in "processing"
        await supabaseAdmin
          .from("scheduled_posts")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", post.id)
          .catch(() => {}); // Don't throw if this update also fails
      }
    }

    console.log(`[cron] Done — ${results.success} published, ${results.failed} failed`);

    return NextResponse.json({
      success:   true,
      processed: posts.length,
      published: results.success,
      failed:    results.failed,
      errors:    results.errors.slice(0, 10), // cap to avoid huge response
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron] Unhandled error:", message);
    return NextResponse.json(
      { error: "Cron job failed", details: message },
      { status: 500 }
    );
  }
}
