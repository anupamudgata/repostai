import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: engagement, error: engError } = await supabase
      .from("post_engagement")
      .select("*")
      .eq("user_id", user.id)
      .order("posted_at", { ascending: false });

    if (engError) {
      console.error("Analytics post_engagement error:", engError);
      return NextResponse.json({ posts: [] });
    }

    const { data: completed } = await supabase
      .from("scheduled_posts")
      .select("id, platform, posted_at, output_id")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .not("posted_at", "is", null)
      .order("posted_at", { ascending: false });

    const completedIds = new Set((engagement ?? []).map((e) => e.scheduled_post_id).filter(Boolean));

    const withoutEngagement = (completed ?? []).filter((c) => !completedIds.has(c.id));

    let outputs: Record<string, { generated_content?: string; edited_content?: string }> = {};
    if (withoutEngagement.length > 0) {
      const outputIds = withoutEngagement.map((c) => c.output_id).filter(Boolean);
      const { data: outData } = await supabase
        .from("repurpose_outputs")
        .select("id, generated_content, edited_content")
        .in("id", outputIds);
      if (outData) {
        outputs = Object.fromEntries(outData.map((o) => [o.id, o]));
      }
    }

    const postsWithEngagement = (engagement ?? []).map((e) => ({
      ...e,
      hasEngagement: true,
    }));

    const completedMapped = withoutEngagement.map((c) => {
      const out = outputs[c.output_id];
      const content = out?.edited_content ?? out?.generated_content ?? "";
      return {
        id: c.id,
        scheduled_post_id: c.id,
        platform: c.platform,
        posted_at: c.posted_at,
        content_preview: content.slice(0, 200),
        likes: 0,
        comments: 0,
        shares: 0,
        impressions: 0,
        clicks: 0,
        hasEngagement: false,
      };
    });

    const all = [...postsWithEngagement, ...completedMapped].sort(
      (a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime()
    );

    return NextResponse.json({ posts: all });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
