import type { Platform, Language } from "@/lib/ai/types";

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
};

const HINDI_QC_RULES = `
HINDI/HINGLISH QUALITY RULES (apply these IN ADDITION to platform rules when content is Hindi):
- Devanagari consistency: Hindi words MUST be in Devanagari script. Any Romanized Hindi (e.g. "bahut", "maine", "kyunki") is a CRITICAL FAIL.
- Code-switching naturalness: English tech terms in Latin script are OK (startup, AI, content, brand). Full English sentences mixed randomly = FAIL.
- Cultural authenticity: Content should sound like a real Indian creator posted it, not like a translated English post. Wooden/formal Hindi (Shuddh news-anchor style) = FAIL.
- Platform formality: LinkedIn = professional आप-based Hinglish. Instagram = casual तुम/यार OK. Reddit = helpful desi tone. Check register matches platform.
- RELAX English-centric rules: "Never start with I" does NOT apply to Hindi (मैंने/मैं is natural). "What do you think?" ban only applies to that English phrase — Hindi equivalents (आपका क्या अनुभव रहा?) are fine.
- Formulaic check: If the output uses overused Hindi openers ("आइये जानते हैं", "दोस्तों आज हम") or stale patterns, flag as issue.`;

export function buildQualityCheckerPrompt(platform: Platform, output: string, language?: Language): string {
  const rules = PLATFORM_RULES[platform];
  const hindiBlock = language === "hi" ? HINDI_QC_RULES : "";
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

/** Batch prompt: check multiple platform outputs in one call. Returns JSON with platform keys. */
export function buildBatchQualityCheckerPrompt(
  items: { platform: Platform; content: string }[],
  language?: Language
): string {
  const hindiBlock = language === "hi" ? HINDI_QC_RULES : "";
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
${hindiBlock}

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
