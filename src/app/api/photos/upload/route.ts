import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { burstLimiter } from "@/lib/ratelimit";
import { analyzePhotoBuffer } from "@/lib/ai/photo-vision";
import {
  isPhotoStorageConfigured,
  processImageForUpload,
  uploadPhotoToR2,
} from "@/lib/storage/r2-photo";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";

export const maxDuration = 120;

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    if (!isPhotoStorageConfigured()) {
      return NextResponse.json(
        {
          error:
            "Photo storage is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL.",
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const burst = await burstLimiter.limit(`photo_upload:${user.id}`);
    if (!burst.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const { plan: effectivePlan, isSuperUser } = await getEffectivePlan(
      supabase,
      user.id,
      user.email
    );
    const entitlements = getEntitlements(effectivePlan);
    const photoLimit = isSuperUser ? null : entitlements.photosPerMonth;

    if (photoLimit === 0) {
      return NextResponse.json(
        {
          error:
            "Photo uploads are not included on the free plan. Upgrade to Starter or higher.",
          code: "PHOTO_PLAN",
        },
        { status: 403 }
      );
    }

    const monthKey = new Date().toISOString().slice(0, 7);
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("photos_uploaded_this_month, photos_usage_month")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[photos/upload] profile read", profileError);
      return NextResponse.json(
        { error: "Could not load your profile. Try again." },
        { status: 500 }
      );
    }

    let usedThisMonth = profile?.photos_uploaded_this_month ?? 0;
    if (profile?.photos_usage_month !== monthKey) usedThisMonth = 0;

    if (
      photoLimit != null &&
      usedThisMonth >= photoLimit
    ) {
      return NextResponse.json(
        {
          error: `Monthly photo limit reached (${photoLimit}). Upgrade or wait until next month.`,
          code: "PHOTO_LIMIT",
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo");
    const contextRaw = formData.get("context");
    const userContext =
      typeof contextRaw === "string" ? contextRaw.slice(0, 2000) : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, or WebP." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    let processed;
    try {
      processed = await processImageForUpload(inputBuffer);
    } catch (e) {
      console.error("[photos/upload] sharp", e);
      return NextResponse.json(
        { error: "Could not read this image. Try another file." },
        { status: 400 }
      );
    }

    let vision;
    try {
      vision = await analyzePhotoBuffer(processed.mainJpeg, userContext);
    } catch (e) {
      console.error("[photos/upload] vision", e);
      return NextResponse.json(
        {
          error:
            "Could not analyze this image. Try a clearer photo or try again later.",
        },
        { status: 422 }
      );
    }

    let uploaded;
    try {
      uploaded = await uploadPhotoToR2(
        user.id,
        file.name || "photo.jpg",
        processed.mainJpeg,
        processed.thumbnailJpeg
      );
    } catch (e) {
      console.error("[photos/upload] r2", e);
      return NextResponse.json(
        { error: "Failed to upload photo to storage." },
        { status: 500 }
      );
    }

    const { data: photoRow, error: insertError } = await supabase
      .from("photo_uploads")
      .insert({
        user_id: user.id,
        storage_key: uploaded.storageKey,
        public_url: uploaded.publicUrl,
        thumbnail_url: uploaded.thumbnailUrl,
        file_size: processed.mainBytes,
        width: processed.width ?? null,
        height: processed.height ?? null,
        format: processed.format ?? "jpeg",
        vision_analysis: vision,
        user_context: userContext ?? null,
        status: "completed",
        error_message: null,
      })
      .select("id, public_url, thumbnail_url, status, vision_analysis")
      .single();

    if (insertError || !photoRow) {
      console.error("[photos/upload] insert", insertError);
      return NextResponse.json(
        { error: "Failed to save photo record." },
        { status: 500 }
      );
    }

    const nextCount =
      profile?.photos_usage_month === monthKey ? usedThisMonth + 1 : 1;
    const { error: usageErr } = await supabase
      .from("profiles")
      .update({
        photos_uploaded_this_month: nextCount,
        photos_usage_month: monthKey,
      })
      .eq("id", user.id);

    if (usageErr) {
      console.error("[photos/upload] usage update", usageErr);
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: photoRow.id,
        url: photoRow.public_url,
        thumbnailUrl: photoRow.thumbnail_url,
        status: photoRow.status,
        visionAnalysis: photoRow.vision_analysis,
      },
    });
  } catch (e) {
    console.error("[photos/upload]", e);
    return NextResponse.json(
      { error: "Unexpected error uploading photo." },
      { status: 500 }
    );
  }
}
