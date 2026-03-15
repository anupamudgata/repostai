import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { regenerateSingle } from "@/lib/ai/openai";
import type { Platform } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, platform } = body as { jobId?: string; platform: string };

    if (!platform) {
      return NextResponse.json(
        { error: "Platform is required" },
        { status: 400 }
      );
    }

    const validPlatforms: Platform[] = [
      "linkedin",
      "twitter_thread",
      "twitter_single",
      "instagram",
      "facebook",
      "email",
      "reddit",
    ];
    if (!validPlatforms.includes(platform as Platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    let originalContent: string;
    let brandVoiceSample: string | undefined;
    let outputLanguage: "en" | "hi" | "es" = "en";

    if (jobId) {
      const { data: job } = await supabase
        .from("repurpose_jobs")
        .select("input_content, output_language, brand_voice_id")
        .eq("id", jobId)
        .eq("user_id", user.id)
        .single();

      if (!job) {
        return NextResponse.json(
          { error: "Job not found" },
          { status: 404 }
        );
      }

      originalContent = job.input_content || "";
      outputLanguage = (job.output_language as "en" | "hi" | "es") || "en";

      if (job.brand_voice_id) {
        const { data: voice } = await supabase
          .from("brand_voices")
          .select("samples")
          .eq("id", job.brand_voice_id)
          .eq("user_id", user.id)
          .single();
        brandVoiceSample = voice?.samples;
      }
    } else {
      const { originalContent: content, brandVoiceId } = body;
      if (!content || typeof content !== "string") {
        return NextResponse.json(
          { error: "originalContent is required when jobId is not provided" },
          { status: 400 }
        );
      }
      originalContent = content;
      if (brandVoiceId) {
        const { data: voice } = await supabase
          .from("brand_voices")
          .select("samples")
          .eq("id", brandVoiceId)
          .eq("user_id", user.id)
          .single();
        brandVoiceSample = voice?.samples;
      }
      if (body.outputLanguage) {
        outputLanguage = body.outputLanguage;
      }
    }

    const newContent = await regenerateSingle(
      originalContent,
      platform as Platform,
      brandVoiceSample,
      outputLanguage
    );

    if (jobId) {
      const { data: existing } = await supabase
        .from("repurpose_outputs")
        .select("id")
        .eq("job_id", jobId)
        .eq("platform", platform)
        .single();

      if (existing) {
        await supabase
          .from("repurpose_outputs")
          .update({ generated_content: newContent })
          .eq("id", existing.id);
      } else {
        await supabase.from("repurpose_outputs").insert({
          job_id: jobId,
          platform,
          generated_content: newContent,
        });
      }
    }

    return NextResponse.json({ content: newContent });
  } catch (error) {
    console.error("Regenerate error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
