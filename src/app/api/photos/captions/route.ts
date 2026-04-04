import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { burstLimiter } from "@/lib/ratelimit";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { photoCaptionsBodySchema } from "@/lib/validators/photos";
import { generatePhotoCaptionsForPlatforms, type PhotoPostPlatform } from "@/lib/photos/generate-captions";
import type { VisionAnalysis } from "@/lib/ai/photo-vision";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const burst = await burstLimiter.limit(`photo_captions:${user.id}`);
    if (!burst.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = photoCaptionsBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 }
      );
    }

    const { photoId, platforms, outputLanguage } = parsed.data;

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
    const captions = await generatePhotoCaptionsForPlatforms(
      analysis,
      platforms as PhotoPostPlatform[],
      entitlements.aiTier,
      outputLanguage,
      photo.user_context ?? undefined
    );

    const { data: run, error: runError } = await supabase
      .from("photo_caption_runs")
      .insert({
        photo_id: photoId,
        user_id: user.id,
        platforms,
        captions,
        status: "draft",
      })
      .select("id, platforms, captions, status")
      .single();

    if (runError || !run) {
      console.error("[photos/captions] insert run", runError);
      return NextResponse.json(
        { error: "Could not save caption draft." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      repurpose: {
        id: run.id,
        captions: run.captions as Record<string, string>,
        platforms: run.platforms,
      },
    });
  } catch (e) {
    console.error("[photos/captions]", e);
    return NextResponse.json(
      { error: "Failed to generate captions." },
      { status: 500 }
    );
  }
}
