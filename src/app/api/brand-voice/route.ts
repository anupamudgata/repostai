import { NextRequest, NextResponse }    from "next/server";
import { createClient }                 from "@/lib/supabase/server";
import { supabaseAdmin }                from "@/lib/supabase/admin";
import { invalidateBrandVoiceCache, warmBrandVoiceCache } from "@/lib/ai/brand-voice-cache";

const PLAN_LIMITS: Record<string, number> = { free: 0, pro: 3, agency: 10 };

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin.from("brand_voices").select("id, name, samples, persona_generated_at, samples_hash, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false });
  const voices = (data ?? []).map((v) => ({ id: v.id, name: v.name, samplesLength: v.samples?.length ?? 0, hasCachedPersona: !!v.samples_hash && !!v.persona_generated_at, createdAt: v.created_at, updatedAt: v.updated_at }));
  return NextResponse.json({ voices });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: subData } = await supabaseAdmin.from("subscriptions").select("plan, status").eq("user_id", user.id).single();
  const plan  = subData?.status === "active" ? (subData.plan as string) : "free";
  const limit = PLAN_LIMITS[plan] ?? 0;
  if (limit === 0) return NextResponse.json({ error: "Brand voice requires a Pro or Agency plan.", upgradeUrl: "/pricing" }, { status: 403 });
  const { count } = await supabaseAdmin.from("brand_voices").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= limit) return NextResponse.json({ error: `Your ${plan} plan supports up to ${limit} brand voice(s). Delete one or upgrade.`, upgradeUrl: plan === "pro" ? "/pricing" : null }, { status: 403 });
  const body = await req.json();
  const { name, samples } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!samples?.trim() || samples.trim().length < 100) return NextResponse.json({ error: "Please provide at least 100 characters of writing samples" }, { status: 400 });
  const { data: newVoice, error: insertError } = await supabaseAdmin.from("brand_voices").insert({ user_id: user.id, name: name.trim(), samples: samples.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }).select("id, name, created_at").single();
  if (insertError || !newVoice) return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  warmBrandVoiceCache(newVoice.id).catch(() => {});
  return NextResponse.json({ voice: { id: newVoice.id, name: newVoice.name, createdAt: newVoice.created_at, hasCachedPersona: false }, message: "Brand voice created." }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, name, samples } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { data: existing } = await supabaseAdmin.from("brand_voices").select("id, user_id").eq("id", id).eq("user_id", user.id).single();
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (name?.trim())    updates.name    = name.trim();
  if (samples?.trim()) updates.samples = samples.trim();
  await supabaseAdmin.from("brand_voices").update(updates).eq("id", id);
  if (samples?.trim()) { await invalidateBrandVoiceCache(id); warmBrandVoiceCache(id).catch(() => {}); }
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  await supabaseAdmin.from("brand_voices").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ success: true });
}
