import type { Platform, Language } from "@/lib/ai/types";
import { getRegionalPrompts } from "@/lib/prompts/regional";

const PLATFORM_RULES: Record<Platform, { maxChars?: number; rules: string[] }> = {
  linkedin:        { maxChars: 3000, rules: ["Must have a hook in first 2 lines","Must end with question or strong close","Must have 3-5 hashtags"] },
  twitter_thread:  { rules: ["Each tweet must be under 280 chars","Must have at least 5 tweets","First tweet must work standalone"] },
  twitter_single:  { maxChars: 280,  rules: ["Must be under 280 characters","No hashtags"] },
  instagram:       { rules: ["Must have first-line hook","Must have CTA before hashtags","Must have 8-15 hashtags"] },
  facebook:        { rules: ["Must end with a question","Must feel personal not corporate"] },
  reddit:          { rules: ["Title must not be promotional","Body must provide value first","No hashtags"] },
  email:           { rules: ["Must have subject line","Must have preview text","Must have single CTA"] },
  tiktok:          { maxChars: 2200, rules: ["Must have a hook in the first line","Must include CTA at end","Keep under 200 words"] },
  whatsapp_status: { maxChars: 700,  rules: ["Must be under 700 characters","Keep personal and conversational","One key takeaway only"] },
  telegram:        { maxChars: 4096, rules: ["Must have an engaging opener","Must end with hashtags or CTA","Keep conversational and newsletter-style"] },
};

const HINDI_QC_RULES = `
HINDI/HINGLISH QUALITY RULES (apply these IN ADDITION to platform rules when content is Hindi):
- Devanagari consistency: Hindi words MUST be in Devanagari script. Any Romanized Hindi (e.g. "bahut", "maine", "kyunki") is a CRITICAL FAIL.
- Code-switching naturalness: English tech terms in Latin script are OK (startup, AI, content, brand). Full English sentences mixed randomly = FAIL.
- Cultural authenticity: Content should sound like a real Indian creator posted it, not like a translated English post. Wooden/formal Hindi (Shuddh news-anchor style) = FAIL.
- Platform formality: LinkedIn = professional आप-based Hinglish. Instagram = casual तुम/यार OK. Reddit = helpful desi tone. Check register matches platform.
- RELAX English-centric rules: "Never start with I" does NOT apply to Hindi (मैंने/मैं is natural). "What do you think?" ban only applies to that English phrase — Hindi equivalents (आपका क्या अनुभव रहा?) are fine.
- Formulaic check: If the output uses overused Hindi openers ("आइये जानते हैं", "दोस्तों आज हम") or stale patterns, flag as issue.`;

function getQcRulesForLanguage(language?: Language): string {
  if (!language) return "";
  if (language === "hi") return HINDI_QC_RULES;
  const regional = getRegionalPrompts(language);
  return regional?.qcRules ?? "";
}

export function buildQualityCheckerPrompt(platform: Platform, output: string, language?: Language): string {
  const rules = PLATFORM_RULES[platform];
  const hindiBlock = getQcRulesForLanguage(language);
  return `You are a quality checker for social media content. Review this ${platform} output and determine if it passes quality standards.

PLATFORM RULES FOR ${platform.toUpperCase()}:
${rules.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}
${rules.maxChars ? `Character limit: ${rules.maxChars} characters maximum` : ""}
${hindiBlock}

CONTENT TO REVIEW:
---
${output}
---

Respond with ONLY valid JSON:
{
  "passed": true or false,
  "issues": ["issue 1 if any"],
  "fixInstruction": "One sentence telling the rewriter exactly what to fix (empty string if passed)"
}

Be strict but fair. A single minor issue should still pass. Multiple issues or a critical failure must fail.`;
}

const LANGUAGE_AUTHENTICITY_RULES: Record<string, string> = {
  mr: `MARATHI AUTHENTICITY RULES:
- Script check: Marathi words MUST appear in Devanagari script. Any Romanized Marathi is a FAIL.
- Avoid Google-Translate Marathi: overly formal constructions like "अत्यंत महत्त्वपूर्ण" when a native speaker would say "खूप important" are a red flag.
- Code-switch check: Natural Marathi-English mix should be present. Pure textbook Marathi or pure English with Marathi flair tacked on = FAIL.
- Register check: LinkedIn/email should use "तुम्ही" register; Instagram/casual can use "तू" where natural.`,

  bn: `BENGALI AUTHENTICITY RULES:
- Script check: Bengali words MUST appear in Bengali script. Romanized Bengali is a FAIL.
- Tone check: Where the context is intellectual, conversational, or adda-style, the content should reflect that warmth and depth — robotic or corporate Bengali = FAIL.
- Avoid overly formal Shuddha Bengali that no one uses online (e.g., "অত্যন্ত গুরুত্বপূর্ণ বিষয়" in a casual post).
- Code-switch check: Natural Bengali-English mix is expected. Purely formal or purely English = FAIL.`,

  te: `TELUGU AUTHENTICITY RULES:
- Script check: Telugu words MUST appear in Telugu script. Romanized Telugu is a FAIL.
- Regional flavor: Where the content is business/tech-oriented, Hyderabad-flavor Tenglish is appropriate and authentic.
- Tenglish mix check: Natural Telugu-English code-switching should be present. Over-formal Telugu or all-English = FAIL.
- Avoid stiff, textbook Telugu that no creator would use on social media.`,

  kn: `KANNADA AUTHENTICITY RULES:
- Script check: Kannada words MUST appear in Kannada script. Romanized Kannada is a FAIL.
- Regional flavor: Bengaluru/tech references and sensibilities are relevant where the content touches startup, tech, or urban life.
- Kanglish mix check: Natural Kannada-English code-switching should be present. Pure formal Kannada or pure English = FAIL.
- Avoid overly literary Kannada that does not reflect how Bangaloreans speak on social.`,

  or: `ODIA AUTHENTICITY RULES:
- Script check: Odia words MUST appear in Odia script. Romanized Odia is a FAIL.
- Cultural pride check: Where natural, content should carry a sense of Odia cultural identity (references to heritage, land, community pride).
- Code-switch check: Natural Odia-English mix expected. Stiff formal Odia or all-English = FAIL.
- Avoid Google-Translate Odia that reads like a direct translation of an English post.`,

  pa: `PUNJABI AUTHENTICITY RULES:
- Script check: Punjabi words MUST appear in Gurmukhi script. Romanized Punjabi is a FAIL.
- Tone check: Punjabi content should carry energy, enthusiasm, and warmth — flat or monotone Punjabi = FAIL.
- Punglish mix check: Natural Punjabi-English code-switching should be present. Only formal Punjabi or only English = FAIL.
- Avoid overly literary Punjabi that no one uses on social media — it should sound like a real Punjabi creator, not a textbook.`,
};

/**
 * Returns language-specific authenticity rules for QC.
 * Supports: mr (Marathi), bn (Bengali), te (Telugu), kn (Kannada), or (Odia), pa (Punjabi).
 * Returns empty string for unsupported codes.
 */
export function getLanguageAuthenticityRules(langCode: string): string {
  return LANGUAGE_AUTHENTICITY_RULES[langCode] ?? "";
}

/** Batch prompt: check multiple platform outputs in one call. Returns JSON with platform keys. */
export function buildBatchQualityCheckerPrompt(
  items: { platform: Platform; content: string }[],
  language?: Language
): string {
  const langQcBlock = getQcRulesForLanguage(language);
  const sections = items
    .map(
      (item, idx) => {
        const rules = PLATFORM_RULES[item.platform];
        return `## ${idx + 1}. ${item.platform.toUpperCase()}
Rules: ${rules.rules.join("; ")}${rules.maxChars ? ` | Max ${rules.maxChars} chars` : ""}

Content:
---
${item.content}
---`;
      }
    )
    .join("\n\n");

  return `You are a quality checker for social media content. Review each platform output below and determine if it passes.
${langQcBlock}

${sections}

Respond with ONLY valid JSON (no markdown):
{
  "results": [
    { "platform": "platform_id", "passed": true/false, "fixInstruction": "one sentence or empty" },
    ...
  ]
}

Match the order of platforms above. Be strict but fair.`;
}
