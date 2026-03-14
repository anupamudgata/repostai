import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { repurposeContent } from "@/lib/ai/openai";
import { scrapeUrl } from "@/lib/scrapers/url-scraper";
import { getYouTubeTranscript } from "@/lib/scrapers/youtube-scraper";
import { repurposeSchema } from "@/lib/validators/repurpose";
import { FREE_TIER_MONTHLY_LIMIT, FREE_PLATFORM_IDS } from "@/config/constants";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const SUPERUSER_EMAIL = "anupam.udgata@gmail.com";
    const isSuperUser = user.email === SUPERUSER_EMAIL;

    const body = await request.json();
    const parsed = repurposeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { inputType, content, url, platforms, brandVoiceId, outputLanguage, userIntent } = parsed.data;

    // Check usage limits for free users
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    const isFreePlan =
      !isSuperUser && (profile?.plan === "free" || !profile?.plan);

    if (isFreePlan) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usage } = await supabase
        .from("usage")
        .select("repurpose_count")
        .eq("user_id", user.id)
        .eq("month", currentMonth)
        .single();

      if (usage && usage.repurpose_count >= FREE_TIER_MONTHLY_LIMIT) {
        return NextResponse.json(
          {
            error: `Free plan limit reached (${FREE_TIER_MONTHLY_LIMIT}/month). Upgrade to Pro for unlimited repurposes.`,
            code: "LIMIT_REACHED",
          },
          { status: 403 }
        );
      }
    }

    // Enforce platform limits for free users
    let allowedPlatforms = platforms;
    if (isFreePlan) {
      allowedPlatforms = platforms.filter((p) =>
        (FREE_PLATFORM_IDS as readonly string[]).includes(p)
      );
      if (allowedPlatforms.length === 0) {
        return NextResponse.json(
          {
            error:
              "Free plan includes LinkedIn, Twitter/X, and Email only. Upgrade to Pro for Instagram, Facebook, and Reddit.",
            code: "PLAN_LIMIT",
          },
          { status: 403 }
        );
      }
    }

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

    // Get brand voice sample if provided
    let brandVoiceSample: string | undefined;
    if (brandVoiceId) {
      const { data: voice } = await supabase
        .from("brand_voices")
        .select("sample_text")
        .eq("id", brandVoiceId)
        .eq("user_id", user.id)
        .single();
      brandVoiceSample = voice?.sample_text;
    }

    // Generate repurposed content
    const outputs = await repurposeContent(
      resolvedContent,
      allowedPlatforms,
      brandVoiceSample,
      outputLanguage,
      userIntent
    );

    // Save to database
    const { data: job } = await supabase
      .from("repurpose_jobs")
      .insert({
        user_id: user.id,
        input_type: inputType,
        input_content: resolvedContent.slice(0, 10000),
        input_url: url || null,
        brand_voice_id: brandVoiceId || null,
        output_language: outputLanguage,
      })
      .select("id")
      .single();

    if (job) {
      const outputRows = Object.entries(outputs).map(
        ([platform, generatedContent]) => ({
          job_id: job.id,
          platform,
          generated_content: generatedContent,
        })
      );

      await supabase.from("repurpose_outputs").insert(outputRows);

      const currentMonth = new Date().toISOString().slice(0, 7);
      await supabase.rpc("increment_usage", {
        p_user_id: user.id,
        p_month: currentMonth,
      });
    }

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
