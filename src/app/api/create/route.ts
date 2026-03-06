import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBlogPost } from "@/lib/ai/content-generator";
import { createContentSchema } from "@/lib/validators/create-content";

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
    const parsed = createContentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { topic, tone, length, audience, outputLanguage, brandVoiceId } =
      parsed.data;

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single();

    if (!profile?.plan || profile.plan === "free") {
      return NextResponse.json(
        {
          error:
            "AI Content Starter is available on Pro and Agency plans. Upgrade to unlock this feature.",
          code: "PLAN_REQUIRED",
        },
        { status: 403 }
      );
    }

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

    const generatedContent = await generateBlogPost(
      topic,
      tone,
      length,
      audience,
      outputLanguage,
      brandVoiceSample
    );

    const { data: post } = await supabase
      .from("created_posts")
      .insert({
        user_id: user.id,
        topic,
        tone,
        length,
        audience,
        output_language: outputLanguage,
        generated_content: generatedContent,
        brand_voice_id: brandVoiceId || null,
      })
      .select("id")
      .single();

    return NextResponse.json({
      postId: post?.id,
      content: generatedContent,
    });
  } catch (error) {
    console.error("Content creation error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
