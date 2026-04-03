import type { SupabaseClient } from "@supabase/supabase-js";
import type { AiTier } from "@/lib/billing/plan-entitlements";
import type { VisionAnalysis } from "@/lib/ai/photo-vision";
import { analyzePhotoBuffer } from "@/lib/ai/photo-vision";
import {
  processImageForUpload,
  uploadPhotoToR2,
} from "@/lib/storage/r2-photo";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

export interface BatchPhotoResult {
  id: string | null;
  thumbnailUrl: string | null;
  publicUrl: string | null;
  visionAnalysis: VisionAnalysis | null;
  status: "completed" | "failed";
  error?: string;
}

interface ProcessFileSuccess {
  ok: true;
  id: string;
  thumbnailUrl: string;
  publicUrl: string;
  visionAnalysis: VisionAnalysis;
}

interface ProcessFileFailure {
  ok: false;
  error: string;
}

type ProcessFileResult = ProcessFileSuccess | ProcessFileFailure;

async function processOneFile(
  file: File,
  userId: string,
  userContext: string | undefined,
  // aiTier reserved for future model routing
  _aiTier: AiTier,
  supabase: SupabaseClient
): Promise<ProcessFileResult> {
  // Validate size
  if (file.size > MAX_BYTES) {
    return { ok: false, error: `"${file.name}" exceeds the 10 MB limit.` };
  }

  // Validate type
  if (!ALLOWED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: `"${file.name}" has an unsupported type. Use JPG, PNG, or WebP.`,
    };
  }

  const bytes = await file.arrayBuffer();
  const inputBuffer = Buffer.from(bytes);

  // Process image (resize/thumbnail) and analyse in parallel
  let processed: Awaited<ReturnType<typeof processImageForUpload>>;
  try {
    processed = await processImageForUpload(inputBuffer);
  } catch (e) {
    console.error("[batch-upload] sharp error for", file.name, e);
    return {
      ok: false,
      error: `Could not read "${file.name}". Try another file.`,
    };
  }

  let vision: VisionAnalysis;
  let uploaded: { publicUrl: string; thumbnailUrl: string; storageKey: string };

  try {
    [vision, uploaded] = await Promise.all([
      analyzePhotoBuffer(processed.mainJpeg, userContext),
      uploadPhotoToR2(
        userId,
        file.name || "photo.jpg",
        processed.mainJpeg,
        processed.thumbnailJpeg
      ),
    ]);
  } catch (e) {
    console.error("[batch-upload] vision/r2 error for", file.name, e);
    return {
      ok: false,
      error: `Failed to process "${file.name}". Try again later.`,
    };
  }

  const { data: photoRow, error: insertError } = await supabase
    .from("photo_uploads")
    .insert({
      user_id: userId,
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
    console.error("[batch-upload] insert error for", file.name, insertError);
    return { ok: false, error: `Failed to save record for "${file.name}".` };
  }

  return {
    ok: true,
    id: photoRow.id as string,
    thumbnailUrl: photoRow.thumbnail_url as string,
    publicUrl: photoRow.public_url as string,
    visionAnalysis: photoRow.vision_analysis as VisionAnalysis,
  };
}

export async function handleBatchUpload(
  files: File[],
  userId: string,
  context: string | undefined,
  supabase: SupabaseClient,
  aiTier: AiTier
): Promise<{ results: BatchPhotoResult[]; successCount: number }> {
  if (files.length === 0) {
    return { results: [], successCount: 0 };
  }

  if (files.length > MAX_FILES) {
    throw new Error(`Too many files. Maximum is ${MAX_FILES} per batch.`);
  }

  const userContext = context?.slice(0, 2000);

  // Process all files concurrently; failures are captured, not thrown
  const settled = await Promise.all(
    files.map((file) => processOneFile(file, userId, userContext, aiTier, supabase))
  );

  const results: BatchPhotoResult[] = settled.map((r) => {
    if (r.ok) {
      return {
        id: r.id,
        thumbnailUrl: r.thumbnailUrl,
        publicUrl: r.publicUrl,
        visionAnalysis: r.visionAnalysis,
        status: "completed",
      };
    }
    return {
      id: null,
      thumbnailUrl: null,
      publicUrl: null,
      visionAnalysis: null,
      status: "failed",
      error: r.error,
    };
  });

  const successCount = results.filter((r) => r.status === "completed").length;
  return { results, successCount };
}
