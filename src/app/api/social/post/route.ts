import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { postToAllPlatforms } from "@/lib/social/post";
import { burstLimiter } from "@/lib/ratelimit";
import type { Platform } from "@/lib/social/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const burst = await burstLimiter.limit(`post:${user.id}`);
    if (!burst.success) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    const body = await req.json();
    const { posts } = body as { posts: Array<{ platform: Platform; text: string; subreddit?: string }> };
    if (!posts || posts.length === 0) return NextResponse.json({ error: "No platforms selected" }, { status: 400 });
    const results = await postToAllPlatforms({ userId: user.id, posts });
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return NextResponse.json({ results, summary: { succeeded, failed, total: results.length } });
  } catch (err) {
    console.error("[social/post] Error:", err);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}
