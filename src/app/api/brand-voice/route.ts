import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";
import { invalidateBrandVoiceCache, warmBrandVoiceCache } from "@/lib/ai/brand-voice-cache";
import { brandVoiceWritingFields } from "@/lib/brand-voice-db";
import {
  getEffectivePlan,
  getBrandVoiceLimit,
} from "@/lib/billing/plan-entitlements";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await supabaseAdmin.from("brand_voices").select("id, name, samples, sample_text, persona_generated_at, samples_hash, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false });
    const voices = (data ?? []).map((v) => {
      const raw = v.samples ?? (v as { sample_text?: string }).sample_text ?? "";
      return {
        id: v.id,
        name: v.name,
        samplesLength: raw.length,
        hasCachedPersona: !!v.samples_hash && !!v.persona_generated_at,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      };
    });
    return NextResponse.json({ voices });
  } catch (err) {
    console.error("[brand-voice] GET error:", err);
    return NextResponse.json({ error: "Failed to load brand voices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
      await ensureProfileForUser(user);
    } catch (e) {
      console.error("[brand-voice] ensure profile:", e);
      return NextResponse.json(
        { error: "Could not prepare your account. Please try again or contact support." },
        { status: 500 }
      );
    }
    const { plan } = await getEffectivePlan(supabase, user.id, user.email);
    const limit = getBrandVoiceLimit(plan);
    const { count } = await supabaseAdmin.from("brand_voices").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    if ((count ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: `Your plan supports up to ${limit} brand voice(s). Delete one or upgrade.`,
          upgradeUrl: plan === "agency" ? null : "/pricing",
        },
        { status: 403 }
      );
    }
    const body = await req.json();
    const { name, samples, humanization_level, imperfection_mode, personal_story_injection } = body;
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!samples?.trim() || samples.trim().length < 100) return NextResponse.json({ error: "Please provide at least 100 characters of writing samples" }, { status: 400 });
    const levelRaw = typeof humanization_level === "string" ? humanization_level : "professional";
    const humanizationOk = levelRaw === "casual" || levelRaw === "professional" || levelRaw === "raw" ? levelRaw : "professional";
    const { data: newVoice, error: insertError } = await supabaseAdmin.from("brand_voices").insert({
      user_id: user.id,
      name: name.trim(),
      ...brandVoiceWritingFields(samples.trim()),
      humanization_level: humanizationOk,
      imperfection_mode: Boolean(imperfection_mode),
      personal_story_injection: Boolean(personal_story_injection),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).select("id, name, created_at").single();
    if (insertError || !newVoice) return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    warmBrandVoiceCache(newVoice.id).catch(() => {});
    return NextResponse.json({ voice: { id: newVoice.id, name: newVoice.name, createdAt: newVoice.created_at, hasCachedPersona: false }, message: "Brand voice created." }, { status: 201 });
  } catch (err) {
    console.error("[brand-voice] POST error:", err);
    return NextResponse.json({ error: "Failed to create brand voice" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const { id, name, samples } = body;
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    if (samples?.trim() && samples.trim().length < 100) {
      return NextResponse.json({ error: "Please provide at least 100 characters of writing samples" }, { status: 400 });
    }
    const { data: existing } = await supabaseAdmin.from("brand_voices").select("id, user_id").eq("id", id).eq("user_id", user.id).single();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const updates: Record<string, string> = { updated_at: new Date().toISOString() };
    if (name?.trim()) updates.name = name.trim();
    if (samples?.trim()) {
      Object.assign(updates, brandVoiceWritingFields(samples.trim()));
    }
    await supabaseAdmin.from("brand_voices").update(updates).eq("id", id);
    if (samples?.trim()) { await invalidateBrandVoiceCache(id); warmBrandVoiceCache(id).catch(() => {}); }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[brand-voice] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update brand voice" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    await supabaseAdmin.from("brand_voices").delete().eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[brand-voice] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete brand voice" }, { status: 500 });
  }
}
