/** Optional DB-backed tuning passed into persona generation. */
export type BrandVoicePersonaPreferences = {
  humanization_level?: string | null;
  imperfection_mode?: boolean | null;
  personal_story_injection?: boolean | null;
};

/**
 * System prompt for Claude: deep brand-voice analyst with structured output contract.
 */
export function buildBrandVoiceSystemPrompt(): string {
  return `You are RepostAI's elite brand-voice analyst. You extract a writer's authentic voice fingerprint from real writing samples, then produce a precise instruction set that a downstream LLM will follow to make every repurposed post sound unmistakably like that human — not like polished AI content.

OUTPUT CONTRACT:
- Output ONE continuous instruction block of 350–500 words in second person ("Write as someone who…", "Mirror…", "Always…", "Never…").
- No title, no section headers, no bullet points, no markdown fences — just dense, flowing prose packed with specifics.
- Every claim must be grounded in actual evidence from the samples. Never invent.

ANALYSIS DIMENSIONS you MUST cover in your paragraph:

1. VOICE FINGERPRINT (2–3 adjectives + why): What is the emotional register? Confident and punchy? Warm and reflective? Dry and analytical? Back each adjective with a pattern from the samples.

2. SENTENCE RHYTHM: Average length tendency (short bursts vs. flowing), use of sentence fragments, parallel structures, cadence. Name the specific pattern.

3. OPENING HOOKS: How do they typically start a post? With a provocative question? A bold claim? A personal anecdote? A stat? Mirror this.

4. VOCABULARY REGISTER: Formal or colloquial? Industry jargon or plain speak? Specific words or phrases they favor. Any recurring metaphors.

5. STRUCTURAL HABITS: Do they use numbered lists? Bullet fragmented lines? Long paragraphs? 3-part structure? How do they close — with a CTA, a reflection, a question back to reader?

6. EMOTION & AUTHENTICITY RATIO: How much do they reveal personal vulnerability vs. authority? How much humor? Sarcasm? Directness vs. nuance? Give a felt sense.

7. HARD NEGATIVES — 3–5 things this writer NEVER does: e.g. "never uses corporate buzzwords like 'synergy' or 'leverage'", "never ends with generic motivation", "never uses exclamation marks". These are guardrails.

8. PLATFORM ADAPTATION: If samples span multiple contexts, describe how the SPIRIT (not the words) shifts across short-form (Twitter) vs. long-form (LinkedIn/blog). The energy stays consistent; the density changes.

CROSS-LINGUAL GUARD: The downstream model may produce content in Hindi, Hinglish, or other Indian languages. Focus on personality, energy, and structural patterns that transfer across languages — not English-specific idioms. The spirit of the voice must survive translation.

QUALITY BAR: A good persona should make a reader who knows this person say "Yes, that sounds exactly like them." Vague personas ("writes clearly, uses simple language") are failures. Be surgical, specific, and honest.`;
}

function buildPreferencesHint(prefs?: BrandVoicePersonaPreferences): string {
  if (!prefs) return "";
  const parts: string[] = [];
  if (prefs.humanization_level) {
    const levelMap: Record<string, string> = {
      casual: "lean casual and conversational — favour contractions, informal phrasing, and relaxed punctuation",
      professional: "maintain a polished, credible tone while staying human — no stiffness, but no sloppiness either",
      raw: "embrace raw authenticity — fragments, lowercase for effect, opinions stated without hedging, direct and sometimes blunt",
    };
    const guidance = levelMap[prefs.humanization_level] ?? prefs.humanization_level;
    parts.push(`HUMANIZATION: The user wants to ${guidance}. Reflect this in the persona's rhythm and diction guidance.`);
  }
  if (prefs.imperfection_mode) {
    parts.push("IMPERFECTION MODE ON: Note in the persona that light human irregularities are intentional — occasional fragments, intentional run-ons, informal capitalization choices. The downstream model should not 'fix' these.");
  }
  if (prefs.personal_story_injection) {
    parts.push("STORY INJECTION ON: Note whether samples already show first-person anecdote framing. If yes, instruct the downstream model to naturally weave in story-based context ('I once…', 'Last week I…') where it fits the platform.");
  }
  if (parts.length === 0) return "";
  return `\nUSER PREFERENCES — weave these into the persona guidance:\n${parts.join("\n")}\n`;
}

/** User message: samples + optional preference hints. */
export function buildBrandVoiceUserContent(
  samples: string,
  prefs?: BrandVoicePersonaPreferences
): string {
  return `${buildPreferencesHint(prefs)}
WRITING SAMPLES:
===
${samples.trim()}
===

Now write the persona instruction block (350–500 words). Be specific, evidence-based, and surgical. No generic phrases. Make this fingerprint unique to this writer.`;
}

/** Legacy single-block prompt (used if callers expect one string). */
export function buildBrandVoicePrompt(samples: string): string {
  return `${buildBrandVoiceSystemPrompt()}

${buildBrandVoiceUserContent(samples)}`;
}
