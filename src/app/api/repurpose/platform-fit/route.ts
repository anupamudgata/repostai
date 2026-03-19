import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/ai/client";

export type PlatformFitScore = {
  platform: string;
  score: number;
  reason: string;
  recommendation: "post" | "consider" | "skip";
};

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
    const outputs = body.outputs as Record<string, string> | undefined;
    const sourceContent = body.sourceContent as string | undefined;

    if (!outputs || typeof outputs !== "object") {
      return NextResponse.json(
        { error: "outputs (platform → content map) is required" },
        { status: 400 }
      );
    }

    const entries = Object.entries(outputs).filter(
      (e): e is [string, string] => typeof e[1] === "string" && e[1].length > 0
    );
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "At least one platform output is required" },
        { status: 400 }
      );
    }

    const platformNames: Record<string, string> = {
      linkedin: "LinkedIn",
      twitter_thread: "Twitter/X Thread",
      twitter_single: "Twitter/X Post",
      instagram: "Instagram",
      facebook: "Facebook",
      email: "Email Newsletter",
      reddit: "Reddit",
      tiktok: "TikTok",
      whatsapp_status: "WhatsApp Status",
    };

    const contentForAnalysis = entries
      .map(([platform, content]) => {
        const name = platformNames[platform] ?? platform;
        return `### ${platform} (${name})\n${content.slice(0, 800)}${content.length > 800 ? "..." : ""}`;
      })
      .join("\n\n");

    const sourceSnippet = sourceContent
      ? `\n\nORIGINAL SOURCE (first 500 chars):\n${sourceContent.slice(0, 500)}`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a content strategist who knows which platforms perform best for which content. Analyze the generated posts and rate each platform's fit (0-10) based on:
- Audience fit (technical vs casual, B2B vs B2C)
- Content format (text-heavy vs visual, long-form vs short)
- Topic suitability (e.g. SaaS deep-dives do better on LinkedIn than Instagram)
- Hook and engagement potential

Return ONLY valid JSON, no markdown. Format:
{
  "scores": [
    {
      "platform": "linkedin",
      "score": 9.2,
      "reason": "Technical audience, story format matches your brand",
      "recommendation": "post" | "consider" | "skip"
    }
  ]
}
Rules:
- score: 0-10, one decimal. 8+ = post, 5-7.9 = consider, <5 = skip
- reason: 1 short sentence explaining the score
- recommendation: "post" for 8+, "consider" for 5-7.9, "skip" for <5
- Include every platform from the input. Use the exact platform ID as the key (e.g. linkedin, twitter_thread, instagram, tiktok)
- Be direct: "Consider skipping Instagram for this post" when fit is weak`,
        },
        {
          role: "user",
          content: `Analyze these platform-specific posts and rate where they'll perform best:${sourceSnippet}\n\n---\n${contentForAnalysis}\n\nReturn the scores JSON.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { scores?: PlatformFitScore[] };

    const validPlatforms = new Set(entries.map(([p]) => p));

    const scores = (parsed.scores ?? []).map((s) => {
      const platformId =
        validPlatforms.has(s.platform) ? s.platform : entries.find(([p]) => p.toLowerCase() === s.platform?.toLowerCase())?.[0] ?? s.platform;
      return {
        platform: platformId,
        score: Math.min(10, Math.max(0, Number(s.score) || 0)),
        reason: String(s.reason || "").slice(0, 120),
        recommendation:
          s.recommendation === "post" || s.recommendation === "skip"
            ? s.recommendation
            : "consider",
      };
    });

    return NextResponse.json({ scores });
  } catch (error) {
    console.error("Platform fit analysis error:", error);
    return NextResponse.json(
      { error: "Could not analyze platform fit" },
      { status: 500 }
    );
  }
}
