import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBlogPost } from "@/lib/ai/content-generator";
import { repurposeContent } from "@/lib/ai/openai";
import { FREE_PLATFORM_IDS, FREE_TIER_WATERMARK, SUPPORTED_PLATFORMS } from "@/config/constants";
import { getEffectivePlan, isFreePlanTier } from "@/lib/billing/plan-entitlements";
import { outputLanguageSchema } from "@/lib/validators/output-language";
import type { OutputLanguage, Platform } from "@/types";

function parseLength(length: string): "short" | "medium" | "long" {
  if (length.toLowerCase().includes("short")) return "short";
  if (length.toLowerCase().includes("long")) return "long";
  return "medium";
}

/** POST /api/content-agent — topic → draft → repurpose to platforms */
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
    const topic = String(body.topic ?? "").trim();
    const audience = String(body.audience ?? "").trim();
    const tone = (String(body.tone ?? "professional").toLowerCase()) as "professional" | "casual" | "humorous" | "inspirational" | "educational";
    const length = parseLength(String(body.length ?? "medium"));
    const langParsed = outputLanguageSchema.safeParse(String(body.language ?? "en").trim() || "en");
    const language: OutputLanguage = langParsed.success ? langParsed.data : "en";

    if (!topic || !audience) {
      return NextResponse.json({ error: "Topic and audience required" }, { status: 400 });
    }

    const validTones = ["professional", "casual", "humorous", "inspirational", "educational"];
    const t = validTones.includes(tone) ? tone : "professional";

    const draft = await generateBlogPost(topic, t, length, audience, language, undefined);

    const { plan: effectivePlan } = await getEffectivePlan(
      supabase,
      user.id,
      user.email
    );
    const isFree = isFreePlanTier(effectivePlan);
    const platforms = (isFree
      ? [...FREE_PLATFORM_IDS]
      : SUPPORTED_PLATFORMS.map((p) => p.id)) as Platform[];

    const repurposeResult = await repurposeContent(
      draft,
      platforms,
      undefined,
      language,
      undefined,
      undefined,
      undefined
    );

    const outputs = Object.entries(repurposeResult).map(([platform, content]) => ({
      platform: platform as Platform,
      content,
    }));

    const watermarked = isFree ? draft.trimEnd() + FREE_TIER_WATERMARK : draft;

    const { data: job, error: jobError } = await supabase
      .from("repurpose_jobs")
      .insert({
        user_id: user.id,
        input_type: "text",
        input_content: watermarked,
        output_language: language,
        status: "completed",
      })
      .select("id")
      .single();

    if (jobError || !job?.id) {
      return NextResponse.json({ draft: watermarked, jobId: null, outputs });
    }

    const outputRows = outputs.map((o) => ({
      job_id: job.id,
      platform: o.platform,
      generated_content: o.content,
    }));

    await supabase.from("repurpose_outputs").insert(outputRows);

    return NextResponse.json({
      draft: watermarked,
      jobId: job.id,
      outputs,
    });
  } catch (error) {
    console.error("Content agent error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
