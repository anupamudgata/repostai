/** Minimum total words across all pasted samples (roughly one strong example). */
export const MIN_BRAND_VOICE_SAMPLE_WORDS = 150;

/** Guidance shown in UI — ideal training set size. */
export const BRAND_VOICE_SAMPLE_IDEAL =
  "Best results: paste 3–5 separate pieces you’ve published, each about 150+ words (a full post or section). Shorter snippets work but often sound more generic.";

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function isVoiceSampleTextSufficient(text: string): boolean {
  return countWords(text.trim()) >= MIN_BRAND_VOICE_SAMPLE_WORDS;
}
