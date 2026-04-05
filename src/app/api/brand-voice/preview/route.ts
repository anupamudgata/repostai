import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  runBrandVoicePreview,
  type BrandVoicePreviewPlatform,
} from "@/lib/ai/brand-voice-preview";
import { burstLimiter } from "@/lib/ratelimit";

const TOPIC_MIN = 10;
const TOPIC_MAX = 2000;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = await burstLimiter.limit(user.id);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please wait a moment.", code: "RATE_LIMITED" }, { status: 429 });
    }

    const body = (await req.json()) as {
      brandVoiceId?: string;
      topic?: string;
      platform?: string;
    };
    const brandVoiceId = typeof body.brandVoiceId === "string" ? body.brandVoiceId.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const platformRaw = body.platform === "twitter_single" ? "twitter_single" : "linkedin";
    const platform = platformRaw as BrandVoicePreviewPlatform;

    if (!brandVoiceId) {
      return NextResponse.json({ error: "brandVoiceId is required" }, { status: 400 });
    }
    if (topic.length < TOPIC_MIN || topic.length > TOPIC_MAX) {
      return NextResponse.json(
        {
          error: `Topic must be between ${TOPIC_MIN} and ${TOPIC_MAX} characters.`,
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data: row, error: fetchError } = await supabase
      .from("brand_voices")
      .select("id")
      .eq("id", brandVoiceId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Brand voice not found" }, { status: 404 });
    }

    const text = await runBrandVoicePreview(brandVoiceId, topic, platform);
    return NextResponse.json({ text, platform });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preview failed";
    console.error("[brand-voice/preview]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
