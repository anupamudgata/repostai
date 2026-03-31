import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repurposeContentForTier } from "@/lib/ai/openai";
import { scrapeUrl } from "@/lib/scrapers/url-scraper";
import { getYouTubeTranscript } from "@/lib/scrapers/youtube-scraper";
import { repurposeSchema } from "@/lib/validators/repurpose";
import { SUPPORTED_PLATFORMS } from "@/config/constants";
import { addFreeTierWatermark } from "@/lib/watermark";
import { notifyZapier } from "@/lib/zapier/notify";
import { getCachedRepurposeOutputs, setCachedRepurposeOutputs } from "@/lib/redis";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { burstLimiter } from "@/lib/ratelimit";
import { captureError } from "@/lib/sentry";
import { ensureProfileReadyForSession } from "@/lib/supabase/ensure-profile";
import {
  insertRepurposeJobWithFallback,
  isLikelyUserProfileFkError,
} from "@/lib/supabase/insert-repurpose-job";

/** Map PostgREST / Postgres errors from repurpose_jobs insert to a safe user message. */
function messageForRepurposeJobInsertError(err: {
  message?: string;
  code?: string | number;
  details?: string;
  hint?: string;
} | null): string {
  if (!err?.message && err?.code == null) {
    return "Failed to create job. Please try again.";
  }
  const msg = err.message ?? "";
  const code = String(err.code ?? "");
  const raw = `${msg} ${(err as { details?: string }).details ?? ""} ${(err as { hint?: string }).hint ?? ""}`;
  const detail = raw.toLowerCase();

  if (/row-level security|RLS/i.test(msg) || code === "42501") {
    return "Could not save your repurpose. Try signing out and signing in again.";
  }

  // FK: message often only has constraint name, e.g. repurpose_jobs_user_id_fkey (no "profiles" text)
  const isFk =
    code === "23503" ||
    /foreign key|violates foreign key/i.test(msg) ||
    /_fkey/i.test(msg);
  if (isFk) {
    const isUserProfileFk =
      detail.includes("user_id_fkey") ||
      detail.includes("repurpose_jobs_user_id") ||
      (detail.includes("user_id") &&
        (detail.includes("profiles") || detail.includes("profile")));
    if (isUserProfileFk) {
      return "Your account profile isn’t ready yet. Refresh the page or sign out and sign in again.";
    }
    const isBrandVoiceFk =
      detail.includes("brand_voice_id_fkey") ||
      detail.includes("brand_voice_id") ||
      (detail.includes("brand_voice") && detail.includes("not present"));
    if (isBrandVoiceFk) {
      return "That brand voice is no longer available. Clear the selection or choose another.";
    }
    return "Could not save this repurpose. Try again or clear the brand voice.";
  }

  if (/check constraint|violates check/i.test(msg) || code === "23514") {
    return "Could not save this repurpose. Check your content and try again.";
  }
  return "Failed to create job. Please try again.";
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

    const burst = await burstLimiter.limit(user.id);
    if (!burst.success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    try {
      await ensureProfileReadyForSession(user, supabase);
    } catch {
      return NextResponse.json(
        { error: "Could not prepare your account. Try again in a moment." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const parsed = repurposeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      inputType,
      content,
      url,
      platforms,
      brandVoiceId,
      outputLanguage,
      userIntent,
      contentAngle,
      hookMode,
      includeBaselineComparison: wantBaselineCompare,
    } = parsed.data;
    const includeBaselineComparison = Boolean(wantBaselineCompare && brandVoiceId);

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
      .maybeSingle();

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
            error: `Monthly repurpose limit reached (${entitlements.repurposesPerMonth}). Upgrade for more.`,
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
              "Your plan includes LinkedIn, Twitter/X, and Instagram only. Upgrade to Pro for all platforms.",
            code: "PLAN_LIMIT",
          },
          { status: 403 }
        );
      }
    }

    const cacheTierKey = entitlements.aiTier === "premium" ? "prem" : entitlements.aiTier === "enhanced" ? "enh" : "std";

    // Resolve content from different input types
    let resolvedContent = content;

    try {
      if (inputType === "url" && url) {
        resolvedContent = await scrapeUrl(url);
      } else if (inputType === "youtube" && url) {
        resolvedContent = await getYouTubeTranscript(url);
      }
    } catch (scrapeError) {
      const msg =
        scrapeError instanceof Error ? scrapeError.message : "";
      if (msg.includes("Could not extract") || msg.includes("URL")) {
        return NextResponse.json(
          { error: "Could not extract content from this URL. Try pasting the text directly." },
          { status: 400 }
        );
      }
      if (msg.includes("transcript") || msg.includes("captions")) {
        return NextResponse.json(
          {
            error:
              "Could not get transcript. The video may have no captions. Enable captions or paste a transcript.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: msg || "Failed to fetch content. Try pasting the text directly." },
        { status: 400 }
      );
    }

    // Get brand voice sample and authenticity settings if provided
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

    const contentToSave = resolvedContent.slice(0, 10000);

    // Redis cache: skip OpenAI if we have cached outputs for this content+platforms+lang+voice
    const cachedOutputs = !includeBaselineComparison
      ? await getCachedRepurposeOutputs(
          contentToSave,
          allowedPlatforms,
          outputLanguage,
          brandVoiceId || null,
          cacheTierKey
        )
      : null;
    if (cachedOutputs && Object.keys(cachedOutputs).length > 0) {
      const outputsToUse = isFreePlan ? addFreeTierWatermark(cachedOutputs) : cachedOutputs;
      const jobInsertPayload = {
        user_id: user.id,
        input_type: inputType,
        input_content: contentToSave,
        input_url: url || null,
        brand_voice_id: brandVoiceId || null,
        output_language: outputLanguage,
      };
      let { data: job, error: cachedJobError } =
        await insertRepurposeJobWithFallback(supabase, jobInsertPayload);
      if (cachedJobError && isLikelyUserProfileFkError(cachedJobError)) {
        try {
          await ensureProfileReadyForSession(user, supabase);
        } catch {
          /* fall through to error response */
        }
        ({ data: job, error: cachedJobError } =
          await insertRepurposeJobWithFallback(supabase, jobInsertPayload));
      }
      if (cachedJobError || !job) {
        console.error("repurpose_jobs insert (cached path):", cachedJobError);
        captureError(cachedJobError ?? new Error("repurpose job insert returned no row"), {
          action: "repurpose_job_insert",
          userId: user.id,
          extra: { cached: true, plan: effectivePlan },
        });
        return NextResponse.json(
          {
            error: messageForRepurposeJobInsertError(cachedJobError),
            code: "JOB_INSERT_FAILED",
          },
          { status: 500 }
        );
      }
      const outputRows = Object.entries(outputsToUse).map(([platform, generatedContent]) => ({
        job_id: job.id,
        platform,
        generated_content: generatedContent,
      }));
      await supabase.from("repurpose_outputs").insert(outputRows);
      await supabase.rpc("increment_usage", { p_user_id: user.id, p_month: currentMonth });
      notifyZapier(profile?.zapier_webhook_url, {
        jobId: job.id,
        outputs: Object.entries(outputsToUse).map(([platform, content]) => ({ platform, content })),
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({
        jobId: job.id,
        outputs: Object.entries(outputsToUse).map(([platform, content]) => ({ platform, content })),
      });
    }

    // Deduplication: return existing job if same content was repurposed in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentJobs } = await supabase
      .from("repurpose_jobs")
      .select("id, input_content, brand_voice_id")
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    const duplicate = recentJobs?.find(
      (j) =>
        j.input_content === contentToSave &&
        (j.brand_voice_id ?? null) === (brandVoiceId ?? null)
    );
    if (!includeBaselineComparison && duplicate) {
      const { data: existingOutputs } = await supabase
        .from("repurpose_outputs")
        .select("platform, generated_content")
        .eq("job_id", duplicate.id)
        .order("platform");

      // Only return duplicate if it has outputs (avoids returning jobs from pre-RLS-fix era)
      if (existingOutputs && existingOutputs.length > 0) {
        return NextResponse.json({
          jobId: duplicate.id,
          outputs: existingOutputs.map((o) => ({
            platform: o.platform,
            content: o.generated_content,
          })),
        });
      }
    }

    // Insert job first (status: pending), then generate
    const jobInsertPayloadMain = {
      user_id: user.id,
      input_type: inputType,
      input_content: contentToSave,
      input_url: url || null,
      brand_voice_id: brandVoiceId || null,
      output_language: outputLanguage,
    };
    let { data: job, error: jobInsertError } =
      await insertRepurposeJobWithFallback(supabase, jobInsertPayloadMain);
    if (jobInsertError && isLikelyUserProfileFkError(jobInsertError)) {
      try {
        await ensureProfileReadyForSession(user, supabase);
      } catch {
        /* fall through to error response */
      }
      ({ data: job, error: jobInsertError } =
        await insertRepurposeJobWithFallback(supabase, jobInsertPayloadMain));
    }

    if (jobInsertError || !job) {
      console.error("repurpose_jobs insert:", jobInsertError);
      captureError(jobInsertError ?? new Error("repurpose job insert returned no row"), {
        action: "repurpose_job_insert",
        userId: user.id,
        extra: { plan: effectivePlan },
      });
      return NextResponse.json(
        {
          error: messageForRepurposeJobInsertError(jobInsertError),
          code: "JOB_INSERT_FAILED",
        },
        { status: 500 }
      );
    }

    // Generate repurposed content: 4+ platforms → 2 parallel batches for speed
    const BATCH_THRESHOLD = 4;
    let outputs: Record<string, string>;
    if (allowedPlatforms.length >= BATCH_THRESHOLD) {
      const mid = Math.ceil(allowedPlatforms.length / 2);
      const batch1 = allowedPlatforms.slice(0, mid);
      const batch2 = allowedPlatforms.slice(mid);
      const [result1, result2] = await Promise.all([
        repurposeContentForTier(
          entitlements.aiTier,
          resolvedContent,
          batch1,
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
          batch2,
          brandVoiceSample,
          outputLanguage,
          userIntent,
          contentAngle,
          hookMode,
          authenticityTuning
        ),
      ]);
      outputs = { ...result1, ...result2 };
    } else {
      outputs = await repurposeContentForTier(
        entitlements.aiTier,
        resolvedContent,
        allowedPlatforms,
        brandVoiceSample,
        outputLanguage,
        userIntent,
        contentAngle,
        hookMode,
        authenticityTuning
      );
    }

    // Cache raw outputs (before watermark) for future requests
    await setCachedRepurposeOutputs(
      contentToSave,
      allowedPlatforms,
      outputLanguage,
      brandVoiceId || null,
      outputs,
      cacheTierKey
    );

    // Add watermark for free users (Pro removes it)
    if (isFreePlan) {
      outputs = addFreeTierWatermark(outputs);
    }

    // Build outputs array: { platform: display name, content, type }
    const PLATFORM_TYPE: Record<string, string> = {
      linkedin: "post",
      twitter_thread: "thread",
      twitter_single: "post",
      instagram: "caption",
      facebook: "post",
      email: "newsletter",
      reddit: "post",
      tiktok: "script",
      whatsapp_status: "status",
    };
    const generatedOutputs = Object.entries(outputs).map(([platformId, content]) => {
      const platformInfo = SUPPORTED_PLATFORMS.find((p) => p.id === platformId);
      return {
        platform: platformInfo?.name ?? platformId,
        content,
        type: PLATFORM_TYPE[platformId] ?? "post",
      };
    });

    // Update job with outputs and status (like repurposed_content pattern)
    const { error: updateError } = await supabase
      .from("repurpose_jobs")
      .update({
        outputs: generatedOutputs,
        status: "completed",
      })
      .eq("id", job.id);

    if (updateError) {
      console.error("Failed to save outputs:", updateError);
      return NextResponse.json(
        { error: "Failed to save outputs. Please try again." },
        { status: 500 }
      );
    }

    // Also insert into repurpose_outputs for per-platform operations (post, schedule, regenerate)
    const outputRows = Object.entries(outputs).map(
      ([platform, generatedContent]) => ({
        job_id: job.id,
        platform,
        generated_content: generatedContent,
      })
    );

    const { error: outputsError } = await supabase
      .from("repurpose_outputs")
      .insert(outputRows);

    if (outputsError) {
      console.error("Failed to save outputs to repurpose_outputs:", outputsError);
      return NextResponse.json(
        { error: "Failed to save outputs. Please try again." },
        { status: 500 }
      );
    }

    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_month: currentMonth,
    });

    notifyZapier(profile?.zapier_webhook_url, {
      jobId: job.id,
      outputs: generatedOutputs,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      jobId: job?.id,
      outputs: Object.entries(outputs).map(([platform, generatedContent]) => ({
        platform,
        content: generatedContent,
      })),
    });
  } catch (error) {
    console.error("Repurpose error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
