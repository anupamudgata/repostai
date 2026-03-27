import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repurposeContentForTier } from "@/lib/ai/openai";
import { scrapeUrl } from "@/lib/scrapers/url-scraper";
import { addFreeTierWatermark } from "@/lib/watermark";
import { notifyZapier } from "@/lib/zapier/notify";
import type { OutputLanguage, Platform } from "@/types";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";
import {
  insertRepurposeJobAdmin,
  isLikelyUserProfileFkError,
} from "@/lib/supabase/insert-repurpose-job";

const MAX_BULK_URLS = 5;
const MIN_BULK_URLS = 2;

function parseUrls(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return s.startsWith("http://") || s.startsWith("https://");
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await ensureProfileForUser(user);
    } catch {
      return NextResponse.json(
        { error: "Could not prepare your account. Try again in a moment." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const urlsRaw = body.urls as string | string[] | undefined;
    const platforms = body.platforms as Platform[] | undefined;
    const brandVoiceId = body.brandVoiceId as string | undefined;
    const outputLanguage = ((body.outputLanguage as string) || "en") as OutputLanguage;
    const userIntent = body.userIntent as string | undefined;
    const contentAngle = body.contentAngle as string | undefined;
    const hookMode = body.hookMode as string | undefined;

    const urls = Array.isArray(urlsRaw)
      ? urlsRaw.filter((u) => typeof u === "string" && u.trim())
      : typeof urlsRaw === "string"
        ? parseUrls(urlsRaw)
        : [];

    const validUrls = urls.filter(isValidUrl);

    if (validUrls.length < MIN_BULK_URLS || validUrls.length > MAX_BULK_URLS) {
      return NextResponse.json(
        { error: `Please provide 2–${MAX_BULK_URLS} valid blog URLs (one per line or comma-separated)` },
        { status: 400 }
      );
    }

    if (!platforms?.length) {
      return NextResponse.json({ error: "Select at least one platform" }, { status: 400 });
    }

    const { plan: effectivePlan, isSuperUser } = await getEffectivePlan(
      supabase,
      user.id,
      user.email
    );
    const entitlements = getEntitlements(effectivePlan);
    const isFreePlan = effectivePlan === "free" && !isSuperUser;

    const { data: profile } = await supabase
      .from("profiles")
      .select("zapier_webhook_url")
      .eq("id", user.id)
      .single();

    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("usage")
      .select("repurpose_count")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .single();

    const used = usage?.repurpose_count ?? 0;
    const jobsCount = validUrls.length;
    if (!isSuperUser && entitlements.repurposesPerMonth != null) {
      if (used + jobsCount > entitlements.repurposesPerMonth) {
        return NextResponse.json(
          {
            error: `Not enough monthly repurposes left (${entitlements.repurposesPerMonth - used} remaining, ${jobsCount} URLs requested). Upgrade for more.`,
            code: "LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    let allowedPlatforms = platforms;
    if (entitlements.allowedPlatformIds) {
      const allow = entitlements.allowedPlatformIds as readonly string[];
      allowedPlatforms = platforms.filter((p) => allow.includes(p));
      if (allowedPlatforms.length === 0) {
        return NextResponse.json(
          {
            error:
              "Your plan includes LinkedIn, Twitter/X, and Instagram only. Upgrade for more platforms.",
            code: "PLAN_LIMIT",
          },
          { status: 403 }
        );
      }
    }

    let brandVoiceSample: string | undefined;
    let authenticityTuning: { humanizationLevel?: string; imperfectionMode?: boolean; personalStoryInjection?: boolean } | undefined;
    if (brandVoiceId) {
      const { data: voice } = await supabase
        .from("brand_voices")
        .select("samples, humanization_level, imperfection_mode, personal_story_injection")
        .eq("id", brandVoiceId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!voice) {
        return NextResponse.json(
          {
            error:
              "That brand voice no longer exists or isn’t yours. Clear the selection or pick another.",
            code: "BRAND_VOICE_NOT_FOUND",
          },
          { status: 400 }
        );
      }
      brandVoiceSample = voice.samples;
      if (
        voice.humanization_level ||
        voice.imperfection_mode ||
        voice.personal_story_injection
      ) {
        authenticityTuning = {
          humanizationLevel: voice.humanization_level ?? undefined,
          imperfectionMode: voice.imperfection_mode ?? false,
          personalStoryInjection: voice.personal_story_injection ?? false,
        };
      }
    }

    const sources: { sourceUrl: string; jobId: string; outputs: { platform: string; content: string }[] }[] = [];

    for (let i = 0; i < validUrls.length; i++) {
      const sourceUrl = validUrls[i]!;
      let resolvedContent: string;

      try {
        resolvedContent = await scrapeUrl(sourceUrl);
      } catch (scrapeError) {
        const msg = scrapeError instanceof Error ? scrapeError.message : "";
        return NextResponse.json(
          { error: `Could not extract content from ${sourceUrl}: ${msg || "Try pasting text directly."}` },
          { status: 400 }
        );
      }

      const BATCH_THRESHOLD = 4;
      let outputs: Record<string, string>;
      if (allowedPlatforms.length >= BATCH_THRESHOLD) {
        const mid = Math.ceil(allowedPlatforms.length / 2);
        const [r1, r2] = await Promise.all([
          repurposeContentForTier(
            entitlements.aiTier,
            resolvedContent,
            allowedPlatforms.slice(0, mid) as Platform[],
            brandVoiceSample,
            outputLanguage,
            userIntent,
            contentAngle,
            hookMode,
            authenticityTuning
          ),
          repurposeContentForTier(
            entitlements.aiTier,
            resolvedContent,
            allowedPlatforms.slice(mid) as Platform[],
            brandVoiceSample,
            outputLanguage,
            userIntent,
            contentAngle,
            hookMode,
            authenticityTuning
          ),
        ]);
        outputs = { ...r1, ...r2 };
      } else {
        outputs = await repurposeContentForTier(
          entitlements.aiTier,
          resolvedContent,
          allowedPlatforms as Platform[],
          brandVoiceSample,
          outputLanguage,
          userIntent,
          contentAngle,
          hookMode,
          authenticityTuning
        );
      }

      // Add watermark for free users (Pro removes it)
      if (isFreePlan) {
        outputs = addFreeTierWatermark(outputs);
      }

      const jobPayload = {
        user_id: user.id,
        input_type: "url",
        input_content: resolvedContent.slice(0, 10000),
        input_url: sourceUrl,
        brand_voice_id: brandVoiceId || null,
        output_language: outputLanguage,
      };
      let { data: job, error: jobInsertErr } =
        await insertRepurposeJobAdmin(jobPayload);
      if (jobInsertErr && isLikelyUserProfileFkError(jobInsertErr)) {
        await ensureProfileForUser(user);
        ({ data: job, error: jobInsertErr } =
          await insertRepurposeJobAdmin(jobPayload));
      }
      if (jobInsertErr || !job) {
        console.error("bulk repurpose_jobs insert:", jobInsertErr);
        return NextResponse.json(
          {
            error:
              jobInsertErr?.message ??
              "Could not save repurpose job. Try again.",
            code: "JOB_INSERT_FAILED",
          },
          { status: 500 }
        );
      }

      const outputRows = Object.entries(outputs).map(([platform, generatedContent]) => ({
        job_id: job.id,
        platform,
        generated_content: generatedContent,
      }));
      await supabase.from("repurpose_outputs").insert(outputRows);

      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_month: currentMonth,
      });

      notifyZapier(profile?.zapier_webhook_url, {
        jobId: job.id,
        sourceUrl,
        outputs: Object.entries(outputs).map(([platform, generatedContent]) => ({
          platform,
          content: generatedContent,
        })),
        createdAt: new Date().toISOString(),
      });

      sources.push({
        sourceUrl,
        jobId: job.id,
        outputs: Object.entries(outputs).map(([platform, content]) => ({ platform, content })),
      });
    }

    const totalOutputs = sources.reduce((sum, s) => sum + s.outputs.length, 0);

    return NextResponse.json({
      sources,
      totalOutputs,
      jobIds: sources.map((s) => s.jobId),
    });
  } catch (error) {
    console.error("Bulk repurpose error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
