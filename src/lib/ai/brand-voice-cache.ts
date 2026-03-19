import crypto                            from "crypto";
import { supabaseAdmin }                 from "@/lib/supabase/admin";
import { buildBrandVoicePrompt }         from "@/lib/ai/prompts/brand-voice";
import { captureError, captureMessage }  from "@/lib/sentry";
import { openai } from "@/lib/ai/client";
const CACHE_TTL_DAYS = 30;

function hashSamples(samples: string): string {
  return crypto.createHash("sha256").update(samples.trim().toLowerCase()).digest("hex").slice(0, 16);
}

function isCacheValid(storedHash: string | null, currentHash: string, generatedAt: string | null): boolean {
  if (!storedHash || !generatedAt) return false;
  if (storedHash !== currentHash) return false;
  const ageDays = (Date.now() - new Date(generatedAt).getTime()) / (1000 * 60 * 60 * 24);
  return ageDays <= CACHE_TTL_DAYS;
}

async function generatePersona(samples: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", temperature: 0.4,
    messages: [{ role: "user", content: buildBrandVoicePrompt(samples) }],
  });
  const persona = response.choices[0]?.message?.content?.trim() ?? "";
  if (!persona) throw new Error("OpenAI returned empty persona");
  return persona;
}

export async function getOrGeneratePersona(brandVoiceId: string): Promise<{ persona: string; fromCache: boolean }> {
  const { data: voice, error: fetchError } = await supabaseAdmin
    .from("brand_voices")
    .select("id, samples, persona, persona_generated_at, samples_hash, user_id")
    .eq("id", brandVoiceId)
    .single();

  if (fetchError || !voice) throw new Error(`Brand voice ${brandVoiceId} not found`);
  if (!voice.samples?.trim()) throw new Error("Brand voice has no samples");

  const currentHash = hashSamples(voice.samples);

  if (voice.persona && isCacheValid(voice.samples_hash, currentHash, voice.persona_generated_at)) {
    captureMessage("Brand voice persona served from cache", "info", { userId: voice.user_id, extra: { brandVoiceId } });
    return { persona: voice.persona, fromCache: true };
  }

  const persona = await generatePersona(voice.samples);

  const { error: saveError } = await supabaseAdmin
    .from("brand_voices")
    .update({ persona, samples_hash: currentHash, persona_generated_at: new Date().toISOString() })
    .eq("id", brandVoiceId);

  if (saveError) captureError(saveError, { action: "brand_voice_cache_save", extra: { brandVoiceId } });

  return { persona, fromCache: false };
}

export async function invalidateBrandVoiceCache(brandVoiceId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("brand_voices")
    .update({ persona: null, samples_hash: null, persona_generated_at: null })
    .eq("id", brandVoiceId);
  if (error) captureError(error, { action: "brand_voice_cache_invalidate", extra: { brandVoiceId } });
}

export async function warmBrandVoiceCache(brandVoiceId: string): Promise<void> {
  try { await getOrGeneratePersona(brandVoiceId); } catch (err) {
    captureError(err, { action: "brand_voice_cache_warm", extra: { brandVoiceId } });
  }
}
