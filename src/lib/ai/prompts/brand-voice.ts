/** Optional DB-backed tuning passed into persona generation. */
export type BrandVoicePersonaPreferences = {
  humanization_level?: string | null;
  imperfection_mode?: boolean | null;
  personal_story_injection?: boolean | null;
};

/**
 * System prompt for Claude (and OpenAI fallback): analyst role + strict output contract.
 */
export function buildBrandVoiceSystemPrompt(): string {
  return `You are RepostAI's brand-voice analyst. You work inside a Next.js + Supabase product that repurposes content for social platforms.

Your single task: read the user's authentic writing samples and produce ONE continuous instruction block (200–300 words) that a downstream LLM will follow so new posts sound like the same human—not generic AI.

Rules:
- Output ONLY the instruction paragraph. No title, no bullets, no "Here is", no markdown fences.
- Write in second person addressed to the downstream model ("Write as someone who…", "Prefer…", "Avoid…").
- Infer concrete patterns: sentence length, vocabulary register, punctuation habits, use of questions, I/you/we balance, energy (calm vs hype), structure (story vs list vs punchy one-liners), repeated phrases, and clear anti-patterns ("never sounds like a press release").
- Do not invent biographical facts not supported by the samples. Stay faithful to the text.
- If samples are short or mixed, say what is uncertain and default to the strongest consistent signals.`;
}

function buildPreferencesHint(prefs?: BrandVoicePersonaPreferences): string {
  if (!prefs) return "";
  const parts: string[] = [];
  if (prefs.humanization_level) {
    parts.push(`Authenticity slider is set to "${prefs.humanization_level}" (casual ↔ professional ↔ raw): bias the described voice toward that end when samples allow.`);
  }
  if (prefs.imperfection_mode) {
    parts.push("User enabled imperfection mode: the downstream voice may include light human irregularity (fragments, casual punctuation)—reflect that in the persona if it fits the samples.");
  }
  if (prefs.personal_story_injection) {
    parts.push("User wants occasional personal anecdote framing when relevant—note if the samples already use first-person stories.");
  }
  if (parts.length === 0) return "";
  return `\nUSER PREFERENCES (apply only if consistent with samples):\n${parts.join("\n")}\n`;
}

/** User message: samples + optional preference hints. */
export function buildBrandVoiceUserContent(
  samples: string,
  prefs?: BrandVoicePersonaPreferences
): string {
  return `${buildPreferencesHint(prefs)}WRITING SAMPLES:
---
${samples.trim()}
---

Respond with ONLY the persona instruction paragraph (200–300 words).`;
}

/** Legacy single-block prompt (used if callers expect one string). */
export function buildBrandVoicePrompt(samples: string): string {
  return `${buildBrandVoiceSystemPrompt()}

${buildBrandVoiceUserContent(samples)}`;
}
