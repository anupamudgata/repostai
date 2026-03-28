import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repurposeContentForTier } from "@/lib/ai/openai";
import type { OutputLanguage, Platform } from "@/types";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";

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
    const { jobId, platform } = body as { jobId?: string; platform: string };

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const validPlatforms: Platform[] = [
      "linkedin",
      "twitter_thread",
      "twitter_single",
      "instagram",
      "facebook",
      "email",
      "reddit",
      "tiktok",
      "whatsapp_status",
    ];
    if (!validPlatforms.includes(platform as Platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    const { plan: effectivePlan, isSuperUser } = await getEffectivePlan(
      supabase,
      user.id,
      user.email
    );
    const entitlements = getEntitlements(effectivePlan);
    if (entitlements.allowedPlatformIds) {
      const allow = entitlements.allowedPlatformIds as readonly string[];
      if (!allow.includes(platform)) {
        return NextResponse.json(
          {
            error:
              "This platform is not on your plan. Upgrade to Pro for all platforms.",
            code: "PLAN_LIMIT",
          },
          { status: 403 }
        );
      }
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("usage")
      .select("repurpose_count")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .maybeSingle();
    const used = usage?.repurpose_count ?? 0;
    if (!isSuperUser && entitlements.repurposesPerMonth != null) {
      if (used >= entitlements.repurposesPerMonth) {
        return NextResponse.json(
          {
            error: "Monthly repurpose limit reached. Upgrade to continue.",
            code: "LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    let originalContent: string;
    let brandVoiceSample: string | undefined;
    let authenticityTuning: { humanizationLevel?: string; imperfectionMode?: boolean; personalStoryInjection?: boolean } | undefined;
    let outputLanguage: OutputLanguage = "en";

    if (jobId) {
      const { data: job } = await supabase
        .from("repurpose_jobs")
        .select("input_content, output_language, brand_voice_id")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .single();

      if (!job) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }

      originalContent = job.input_content || "";
      outputLanguage = (job.output_language as OutputLanguage) || "en";

      if (job.brand_voice_id) {
        const { data: voice } = await supabase
          .from("brand_voices")
          .select("samples, humanization_level, imperfection_mode, personal_story_injection")
          .eq("id", job.brand_voice_id)
          .eq("user_id", user.id)
          .single();
        brandVoiceSample = voice?.samples;
        authenticityTuning = voice && (voice.humanization_level || voice.imperfection_mode || voice.personal_story_injection)
          ? { humanizationLevel: voice.humanization_level ?? undefined, imperfectionMode: voice.imperfection_mode ?? false, personalStoryInjection: voice.personal_story_injection ?? false }
          : undefined;
      }
    } else {
      const { originalContent: content, brandVoiceId } = body;
      if (!content || typeof content !== "string") {
        return NextResponse.json(
          { error: "originalContent is required when jobId is not provided" },
          { status: 400 }
        );
      }
      if (content.length > 50000) {
        return NextResponse.json(
          { error: "Content is too long (max 50,000 characters)." },
          { status: 400 }
        );
      }
      originalContent = content;
      if (brandVoiceId) {
        const { data: voice } = await supabase
          .from("brand_voices")
          .select("samples, humanization_level, imperfection_mode, personal_story_injection")
          .eq("id", brandVoiceId)
          .eq("user_id", user.id)
          .single();
        brandVoiceSample = voice?.samples;
        authenticityTuning = voice && (voice.humanization_level || voice.imperfection_mode || voice.personal_story_injection)
          ? { humanizationLevel: voice.humanization_level ?? undefined, imperfectionMode: voice.imperfection_mode ?? false, personalStoryInjection: voice.personal_story_injection ?? false }
          : undefined;
      }
      if (body.outputLanguage) {
        outputLanguage = body.outputLanguage;
      }
    }

    const results = await repurposeContentForTier(
      entitlements.aiTier,
      originalContent,
      [platform as Platform],
      brandVoiceSample,
      outputLanguage,
      undefined,
      undefined,
      undefined,
      authenticityTuning
    );
    const newContent = results[platform as Platform] ?? "";

    if (!isSuperUser) {
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_month: currentMonth,
      });
    }

    if (jobId) {
      const { data: existing } = await supabase
        .from("repurpose_outputs")
        .select("id")
        .eq("job_id", jobId)
        .eq("platform", platform)
        .single();

      if (existing) {
        await supabase
          .from("repurpose_outputs")
          .update({ generated_content: newContent })
          .eq("id", existing.id);
      } else {
        await supabase.from("repurpose_outputs").insert({
          job_id: jobId,
          platform,
          generated_content: newContent,
        });
      }
    }

    return NextResponse.json({ content: newContent });
  } catch (error) {
    console.error("Regenerate error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
