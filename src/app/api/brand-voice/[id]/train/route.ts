import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrGeneratePersona } from "@/lib/ai/brand-voice-cache";

/**
 * Regenerates or loads the cached brand voice persona (voice fingerprint).
 * Use when initial warm failed or user clicks Retry.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Voice ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: row, error: fetchError } = await supabase
      .from("brand_voices")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError || !row) {
      return NextResponse.json({ error: "Brand voice not found" }, { status: 404 });
    }

    const { persona, fromCache } = await getOrGeneratePersona(id);
    return NextResponse.json({ ok: true, persona, fromCache });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Training failed";
    console.error("[brand-voice/train]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
