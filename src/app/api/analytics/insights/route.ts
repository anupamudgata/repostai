import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import { buildAnalyticsInsightsPrompt } from "@/lib/ai/prompts/analytics-insights";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: engagement } = await supabase
      .from("post_engagement")
      .select("*")
      .eq("user_id", user.id)
      .order("posted_at", { ascending: false })
      .limit(50);

    const posts = engagement ?? [];

    const byPlatform: Record<string, { count: number; totalEngagement: number }> = {};
    const byDayOfWeek: Record<string, number> = {};
    const byHour: Record<string, number> = {};

    let totalEngagement = 0;

    for (const p of posts) {
      const eng = p.likes + p.comments + p.shares;
      totalEngagement += eng;

      byPlatform[p.platform] = byPlatform[p.platform] ?? { count: 0, totalEngagement: 0 };
      byPlatform[p.platform].count += 1;
      byPlatform[p.platform].totalEngagement += eng;

      const d = new Date(p.posted_at);
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
      byDayOfWeek[day] = (byDayOfWeek[day] ?? 0) + 1;

      const hour = d.getUTCHours();
      byHour[String(hour)] = (byHour[String(hour)] ?? 0) + 1;
    }

    const summary = {
      totalPosts: posts.length,
      totalEngagement,
      byPlatform: Object.fromEntries(
        Object.entries(byPlatform).map(([k, v]) => [
          k,
          { count: v.count, avgEngagement: v.count > 0 ? Math.round(v.totalEngagement / v.count) : 0 },
        ])
      ),
      byDayOfWeek,
      byHour,
    };

    if (posts.length < 2) {
      return NextResponse.json({
        insights: [
          "Add more engagement data to unlock AI-powered insights.",
          "Track likes, comments, and shares for each post to discover your best-performing content.",
          "Once you have 5+ posts with metrics, we'll show insights like 'Your LinkedIn posts perform 3x better on Tuesdays at 10 AM.'",
        ],
      });
    }

    const prompt = buildAnalyticsInsightsPrompt({
      posts: posts.map((p) => ({
        platform: p.platform,
        posted_at: p.posted_at,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares,
        impressions: p.impressions,
        content_preview: p.content_preview ?? undefined,
      })),
      summary,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0]?.message?.content ?? "[]";
    let insights: string[] = [];
    try {
      insights = JSON.parse(raw.replace(/```json|```/g, "").trim()) as string[];
      if (!Array.isArray(insights)) insights = [String(insights)];
    } catch {
      insights = raw.split("\n").filter((s) => s.trim().length > 10).slice(0, 5);
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
