/** Minimum total words across samples (matches client training form). */
export const MIN_BRAND_VOICE_WORDS = 300;

export function countBrandVoiceWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function validateBrandVoiceSampleWords(samples: string):
  | { ok: true; wordCount: number }
  | { ok: false; wordCount: number; min: number } {
  const wordCount = countBrandVoiceWords(samples);
  if (wordCount < MIN_BRAND_VOICE_WORDS) {
    return { ok: false, wordCount, min: MIN_BRAND_VOICE_WORDS };
  }
  return { ok: true, wordCount };
}
