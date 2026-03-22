import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  postPhotoCaptionsToPlatforms,
  type PhotoCaptionPayload,
} from "@/lib/photos/post-photo-captions";
import type { PhotoPostPlatform } from "@/lib/photos/generate-captions";

export async function finalizePhotoCaptionRunAdmin(opts: {
  runId: string;
  userId: string;
  publicImageUrl: string;
  captions: PhotoCaptionPayload;
  platforms: PhotoPostPlatform[];
}): Promise<{
  results: Awaited<ReturnType<typeof postPhotoCaptionsToPlatforms>>;
  postUrls: Record<string, string>;
  errors: Record<string, string>;
  locked: boolean;
}> {
  const { runId, userId, publicImageUrl, captions, platforms } = opts;

  const now = new Date().toISOString();
  const { data: lockedRows, error: lockError } = await supabaseAdmin
    .from("photo_caption_runs")
    .update({ status: "posting", updated_at: now })
    .eq("id", runId)
    .eq("user_id", userId)
    .in("status", ["draft", "scheduled"])
    .select("id");

  if (lockError || !lockedRows?.length) {
    return {
      results: [],
      postUrls: {},
      errors: { _: "This post is already publishing, scheduled, or completed." },
      locked: false,
    };
  }

  let results: Awaited<ReturnType<typeof postPhotoCaptionsToPlatforms>>;
  try {
    results = await postPhotoCaptionsToPlatforms(
      userId,
      publicImageUrl,
      captions,
      platforms
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Publish failed";
    await supabaseAdmin
      .from("photo_caption_runs")
      .update({
        status: "failed",
        error: msg,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .eq("user_id", userId);
    return {
      results: [],
      postUrls: {},
      errors: { _: msg },
      locked: true,
    };
  }

  const postUrls: Record<string, string> = {};
  const errors: Record<string, string> = {};
  for (const r of results) {
    if (r.success && r.postUrl) postUrls[r.platform] = r.postUrl;
    if (!r.success && r.error) errors[r.platform] = r.error;
  }

  const anyOk = results.some((r) => r.success);

  await supabaseAdmin
    .from("photo_caption_runs")
    .update({
      status: anyOk ? "posted" : "failed",
      posted_at: anyOk ? new Date().toISOString() : null,
      post_urls: postUrls,
      error: Object.keys(errors).length ? JSON.stringify(errors) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .eq("user_id", userId);

  return { results, postUrls, errors, locked: true };
}
