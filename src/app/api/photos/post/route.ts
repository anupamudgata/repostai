import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { burstLimiter } from "@/lib/ratelimit";
import { photoPostBodySchema } from "@/lib/validators/photos";
import { finalizePhotoCaptionRunAdmin } from "@/lib/photos/complete-photo-post";
import type { PhotoPostPlatform } from "@/lib/photos/generate-captions";

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

    const burst = await burstLimiter.limit(`photo_post:${user.id}`);
    if (!burst.success) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = photoPostBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid body" },
        { status: 400 }
      );
    }

    const { captionRunId, captions: bodyCaptions, scheduledFor } = parsed.data;

    const { data: run, error: runError } = await supabase
      .from("photo_caption_runs")
      .select(
        `
        id,
        user_id,
        status,
        platforms,
        captions,
        photo_uploads ( public_url )
      `
      )
      .eq("id", captionRunId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (runError || !run) {
      return NextResponse.json({ error: "Caption run not found" }, { status: 404 });
    }

    if (run.status !== "draft" && run.status !== "scheduled") {
      return NextResponse.json(
        { error: "This post has already been published or is in progress." },
        { status: 400 }
      );
    }

    const rawPhoto = run.photo_uploads as
      | { public_url: string }
      | { public_url: string }[]
      | null;
    const photo = Array.isArray(rawPhoto) ? rawPhoto[0] ?? null : rawPhoto;
    if (!photo?.public_url) {
      return NextResponse.json(
        { error: "Photo asset missing for this run." },
        { status: 400 }
      );
    }

    const baseCaptions = (run.captions ?? {}) as Record<string, string>;
    const merged: Record<string, string> = { ...baseCaptions };
    if (bodyCaptions) {
      for (const [k, v] of Object.entries(bodyCaptions)) {
        merged[k] = v;
      }
    }

    if (scheduledFor) {
      const when = new Date(scheduledFor);
      if (Number.isNaN(when.getTime()) || when.getTime() < Date.now() - 60_000) {
        return NextResponse.json(
          { error: "Pick a future date and time for scheduling." },
          { status: 400 }
        );
      }

      if (run.status !== "draft") {
        return NextResponse.json(
          { error: "Only draft posts can be scheduled." },
          { status: 400 }
        );
      }

      const { error: updErr } = await supabase
        .from("photo_caption_runs")
        .update({
          status: "scheduled",
          scheduled_for: when.toISOString(),
          captions: merged,
          updated_at: new Date().toISOString(),
        })
        .eq("id", captionRunId)
        .eq("user_id", user.id)
        .eq("status", "draft");

      if (updErr) {
        console.error("[photos/post] schedule", updErr);
        return NextResponse.json(
          { error: "Could not schedule post." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scheduled: true,
        scheduledFor: when.toISOString(),
      });
    }

    if (run.status !== "draft") {
      return NextResponse.json(
        { error: "Scheduled posts are published by the server on time." },
        { status: 400 }
      );
    }

    const { error: capErr } = await supabase
      .from("photo_caption_runs")
      .update({
        captions: merged,
        updated_at: new Date().toISOString(),
      })
      .eq("id", captionRunId)
      .eq("user_id", user.id);

    if (capErr) {
      console.error("[photos/post] captions", capErr);
    }

    const platforms = (run.platforms ?? []) as PhotoPostPlatform[];

    const out = await finalizePhotoCaptionRunAdmin({
      runId: captionRunId,
      userId: user.id,
      publicImageUrl: photo.public_url,
      captions: merged,
      platforms,
    });

    if (!out.locked) {
      return NextResponse.json(
        { success: false, error: out.errors._ ?? "Could not start publishing." },
        { status: 409 }
      );
    }

    const anyOk = out.results.some((r) => r.success);

    return NextResponse.json({
      success: anyOk,
      postUrls: out.postUrls,
      errors:
        Object.keys(out.errors).length > 0 ? out.errors : undefined,
      results: out.results,
    });
  } catch (e) {
    console.error("[photos/post]", e);
    return NextResponse.json({ error: "Failed to post." }, { status: 500 });
  }
}
