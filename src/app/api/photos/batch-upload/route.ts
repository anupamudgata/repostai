import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { burstLimiter } from "@/lib/ratelimit";
import { isPhotoStorageConfigured } from "@/lib/storage/r2-photo";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { handleBatchUpload } from "@/lib/photos/batch-upload-handler";

export const maxDuration = 120;

const MAX_FILES = 10;

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

    const burst = await burstLimiter.limit(`photo_batch_upload:${user.id}`);
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
      console.error("[photos/batch-upload] profile read", profileError);
      return NextResponse.json(
        { error: "Could not load your profile. Try again." },
        { status: 500 }
      );
    }

    let usedThisMonth = profile?.photos_uploaded_this_month ?? 0;
    if (profile?.photos_usage_month !== monthKey) usedThisMonth = 0;

    const formData = await req.formData();
    const rawFiles = formData.getAll("photos[]");
    const contextRaw = formData.get("context");
    const userContext =
      typeof contextRaw === "string" ? contextRaw.slice(0, 2000) : undefined;

    const files = rawFiles.filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided. Send at least one photo in photos[]." },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Too many files. Maximum is ${MAX_FILES} per batch.` },
        { status: 400 }
      );
    }

    // Check quota: ensure there is room for all requested files
    if (photoLimit != null && usedThisMonth + files.length > photoLimit) {
      const remaining = Math.max(0, photoLimit - usedThisMonth);
      return NextResponse.json(
        {
          error: `Not enough quota. You have ${remaining} photo upload(s) remaining this month (limit ${photoLimit}). Upgrade or wait until next month.`,
          code: "PHOTO_LIMIT",
          remaining,
        },
        { status: 403 }
      );
    }

    const { results, successCount } = await handleBatchUpload(
      files,
      user.id,
      userContext,
      supabase,
      entitlements.aiTier
    );

    // Only charge quota for successfully processed photos
    if (successCount > 0) {
      const nextCount =
        profile?.photos_usage_month === monthKey
          ? usedThisMonth + successCount
          : successCount;
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
    }

    return NextResponse.json({
      photos: results.map((r) => ({
        id: r.id,
        thumbnailUrl: r.thumbnailUrl,
        publicUrl: r.publicUrl,
        status: r.status,
        ...(r.error ? { error: r.error } : {}),
      })),
    });
  } catch (e) {
    console.error("[photos/batch-upload]", e);
    return NextResponse.json(
      { error: "Unexpected error processing batch upload." },
      { status: 500 }
    );
  }
}
