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
const MAX_FILES = 10;

export async function POST(req: NextRequest) {
  try {
    if (!isPhotoStorageConfigured()) {
      return NextResponse.json(
        { error: "Photo storage is not configured." },
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
          error: "Photo uploads are not included on the free plan. Upgrade to Starter or higher.",
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
      console.error("[photos/batch-upload] profile read", profileError);
      return NextResponse.json(
        { error: "Could not load your profile. Try again." },
        { status: 500 }
      );
    }

    let usedThisMonth = profile?.photos_uploaded_this_month ?? 0;
    if (profile?.photos_usage_month !== monthKey) usedThisMonth = 0;

    const formData = await req.formData();
    const contextRaw = formData.get("context");
    const userContext = typeof contextRaw === "string" ? contextRaw.slice(0, 2000) : undefined;
    const files = formData.getAll("photos[]").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} photos per batch.` },
        { status: 400 }
      );
    }

    if (photoLimit != null && usedThisMonth + files.length > photoLimit) {
      return NextResponse.json(
        {
          error: `Monthly photo limit would be exceeded (${photoLimit} total). Upgrade or wait until next month.`,
          code: "PHOTO_LIMIT",
        },
        { status: 403 }
      );
    }

    const results: { id: string; publicUrl: string; thumbnailUrl: string; status: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: `File "${file.name}" is too large. Maximum size is 10MB.` },
          { status: 400 }
        );
      }
      if (!ALLOWED.has(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a supported type. Use JPG, PNG, or WebP.` },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      let processed;
      try {
        processed = await processImageForUpload(inputBuffer);
      } catch (e) {
        console.error("[photos/batch-upload] sharp", e);
        return NextResponse.json(
          { error: `Could not read "${file.name}". Try another file.` },
          { status: 400 }
        );
      }

      let vision;
      try {
        vision = await analyzePhotoBuffer(processed.mainJpeg, userContext);
      } catch (e) {
        console.error("[photos/batch-upload] vision", e);
        return NextResponse.json(
          { error: `Could not analyze "${file.name}". Try a clearer photo.` },
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
        console.error("[photos/batch-upload] r2", e);
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json(
          { error: `Failed to upload photo to storage: ${msg}` },
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
        .select("id, public_url, thumbnail_url, status")
        .single();

      if (insertError || !photoRow) {
        console.error("[photos/batch-upload] insert", insertError);
        return NextResponse.json(
          { error: "Failed to save photo record." },
          { status: 500 }
        );
      }

      results.push({
        id: photoRow.id,
        publicUrl: photoRow.public_url,
        thumbnailUrl: photoRow.thumbnail_url,
        status: photoRow.status,
      });
    }

    const nextCount =
      profile?.photos_usage_month === monthKey ? usedThisMonth + results.length : results.length;
    const { error: usageErr } = await supabase
      .from("profiles")
      .update({
        photos_uploaded_this_month: nextCount,
        photos_usage_month: monthKey,
      })
      .eq("id", user.id);

    if (usageErr) {
      console.error("[photos/batch-upload] usage update", usageErr);
    }

    return NextResponse.json({
      success: true,
      photos: results,
    });
  } catch (e) {
    console.error("[photos/batch-upload]", e);
    return NextResponse.json(
      { error: "Unexpected error uploading photos." },
      { status: 500 }
    );
  }
}
