import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { burstLimiter } from "@/lib/ratelimit";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { photoCaptionsBodySchema } from "@/lib/validators/photos";
import { generatePhotoCaptionVariations, type PhotoPostPlatform } from "@/lib/photos/generate-captions";
import type { VisionAnalysis } from "@/lib/ai/photo-vision";
import { z } from "zod";

export const maxDuration = 120;

const variationsBodySchema = photoCaptionsBodySchema.extend({
  count: z.number().int().min(1).max(5).optional().default(3),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const burst = await burstLimiter.limit(`photo_captions_variations:${user.id}`);
    if (!burst.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = variationsBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 }
      );
    }

    const { photoId, platforms, outputLanguage, count } = parsed.data;

    const { data: photo, error: photoError } = await supabase
      .from("photo_uploads")
      .select("id, status, vision_analysis, user_context")
      .eq("id", photoId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (photoError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (photo.status !== "completed" || !photo.vision_analysis) {
      return NextResponse.json(
        { error: "Photo is not ready for captions yet." },
        { status: 400 }
      );
    }

    const { plan: effectivePlan, isSuperUser } = await getEffectivePlan(
      supabase,
      user.id,
      user.email
    );
    const entitlements = getEntitlements(effectivePlan);
    if (!isSuperUser && entitlements.photosPerMonth === 0) {
      return NextResponse.json(
        { error: "Photo captions require a paid plan." },
        { status: 403 }
      );
    }

    const analysis = photo.vision_analysis as VisionAnalysis;
    const variations = await generatePhotoCaptionVariations(
      analysis,
      platforms as PhotoPostPlatform[],
      entitlements.aiTier,
      outputLanguage,
      count,
      photo.user_context ?? undefined
    );

    // Use first variation of each platform as the default captions for the run
    const defaultCaptions: Record<string, string> = {};
    for (const [platform, vars] of Object.entries(variations)) {
      if (Array.isArray(vars) && vars[0]) defaultCaptions[platform] = vars[0];
    }

    const { data: run, error: runError } = await supabase
      .from("photo_caption_runs")
      .insert({
        photo_id: photoId,
        user_id: user.id,
        platforms,
        captions: defaultCaptions,
        status: "draft",
      })
      .select("id")
      .single();

    if (runError || !run) {
      console.error("[photos/captions/variations] insert run", runError);
      return NextResponse.json(
        { error: "Could not save caption draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({ variations, runId: run.id });
  } catch (e) {
    console.error("[photos/captions/variations]", e);
    return NextResponse.json(
      { error: "Failed to generate caption variations." },
      { status: 500 }
    );
  }
}
