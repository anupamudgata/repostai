import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLATFORMS = ["linkedin", "twitter", "twitter_thread", "twitter_single", "instagram", "facebook"] as const;

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
    const scheduledPostId = body.scheduledPostId as string | undefined;
    const platform = body.platform as string | undefined;
    const contentPreview = body.contentPreview as string | undefined;
    const postedAt = body.postedAt as string | undefined;
    const likes = Math.max(0, Number(body.likes) || 0);
    const comments = Math.max(0, Number(body.comments) || 0);
    const shares = Math.max(0, Number(body.shares) || 0);
    const impressions = Math.max(0, Number(body.impressions) || 0);
    const clicks = Math.max(0, Number(body.clicks) || 0);

    if (!platform || !PLATFORMS.includes(platform as (typeof PLATFORMS)[number])) {
      return NextResponse.json(
        { error: "Valid platform required (linkedin, twitter, twitter_thread, twitter_single, instagram, facebook)" },
        { status: 400 }
      );
    }

    const at = postedAt ? new Date(postedAt) : new Date();
    if (Number.isNaN(at.getTime())) {
      return NextResponse.json({ error: "Invalid postedAt date" }, { status: 400 });
    }

    if (scheduledPostId) {
      const { data: existing } = await supabase
        .from("scheduled_posts")
        .select("id")
        .eq("id", scheduledPostId)
        .eq("user_id", user.id)
        .single();

      if (!existing) {
        return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
      }
    }

    const { data, error } = await supabase
      .from("post_engagement")
      .insert({
        user_id: user.id,
        scheduled_post_id: scheduledPostId || null,
        platform,
        content_preview: contentPreview?.slice(0, 500) || null,
        posted_at: at.toISOString(),
        likes,
        comments,
        shares,
        impressions,
        clicks,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Engagement insert error:", error);
      return NextResponse.json(
        { error: "Failed to save engagement" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Engagement API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
