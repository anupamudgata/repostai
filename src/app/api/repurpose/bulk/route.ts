import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repurposeContent } from "@/lib/ai/openai";
import { scrapeUrl } from "@/lib/scrapers/url-scraper";
import { FREE_TIER_MONTHLY_LIMIT, FREE_PLATFORM_IDS, SUPERUSER_EMAIL } from "@/config/constants";
import { addFreeTierWatermark } from "@/lib/watermark";
import { notifyZapier } from "@/lib/zapier/notify";
import type { Platform } from "@/types";

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

    const isSuperUser = user.email === SUPERUSER_EMAIL;

    const body = await request.json();
    const urlsRaw = body.urls as string | string[] | undefined;
    const platforms = body.platforms as Platform[] | undefined;
    const brandVoiceId = body.brandVoiceId as string | undefined;
    const outputLanguage = (body.outputLanguage as string) || "en";
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, zapier_webhook_url")
      .eq("id", user.id)
      .single();

    const isFreePlan = !isSuperUser && (profile?.plan === "free" || !profile?.plan);

    if (isFreePlan) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usage } = await supabase
        .from("usage")
        .select("repurpose_count")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .single();

      if (Number.isFinite(FREE_TIER_MONTHLY_LIMIT) && usage && usage.repurpose_count >= FREE_TIER_MONTHLY_LIMIT) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${FREE_TIER_MONTHLY_LIMIT}/month). Upgrade to Pro for unlimited.`,
            code: "LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    let allowedPlatforms = platforms;
    if (isFreePlan) {
      allowedPlatforms = platforms.filter((p) =>
        (FREE_PLATFORM_IDS as readonly string[]).includes(p)
      );
      if (allowedPlatforms.length === 0) {
        return NextResponse.json(
          { error: "Free plan: LinkedIn, Twitter/X, Email only. Upgrade for more." },
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
        .single();
      brandVoiceSample = voice?.samples;
      if (voice && (voice.humanization_level || voice.imperfection_mode || voice.personal_story_injection)) {
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
          repurposeContent(resolvedContent, allowedPlatforms.slice(0, mid) as Platform[], brandVoiceSample, outputLanguage as "en", userIntent, contentAngle, hookMode, authenticityTuning),
          repurposeContent(resolvedContent, allowedPlatforms.slice(mid) as Platform[], brandVoiceSample, outputLanguage as "en", userIntent, contentAngle, hookMode, authenticityTuning),
        ]);
        outputs = { ...r1, ...r2 };
      } else {
        outputs = await repurposeContent(
          resolvedContent,
          allowedPlatforms as Platform[],
          brandVoiceSample,
          outputLanguage as "en",
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

      const { data: job } = await supabase
        .from("repurpose_jobs")
        .insert({
          user_id: user.id,
          input_type: "url",
          input_content: resolvedContent.slice(0, 10000),
          input_url: sourceUrl,
          brand_voice_id: brandVoiceId || null,
          output_language: outputLanguage,
        })
        .select("id")
        .single();

      if (job) {
        const outputRows = Object.entries(outputs).map(([platform, generatedContent]) => ({
          job_id: job.id,
          platform,
          generated_content: generatedContent,
        }));
        await supabase.from("repurpose_outputs").insert(outputRows);

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
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_month: currentMonth,
    });

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
