import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { openai } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { text } = await request.json();
  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return NextResponse.json({ error: "Text too short" }, { status: 400 });
  }

  const prompt = `You are a content quality analyst for social media repurposing.

Analyze this text and return a JSON object with exactly these fields:
- score: number from 0 to 100 (how well this text will repurpose across social platforms)
- label: one of "Poor", "Fair", "Good", "Great", "Excellent"
- feedback: 1-2 sentence explanation of the score
- improved: a rewritten version of the text optimized for social media repurposing (clear hook, good structure, concise, engaging)

Text to analyze:
"""
${text.slice(0, 4000)}
"""

Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      label: parsed.label ?? "Fair",
      feedback: parsed.feedback ?? "",
      improved: parsed.improved ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Failed to score text" }, { status: 500 });
  }
}
