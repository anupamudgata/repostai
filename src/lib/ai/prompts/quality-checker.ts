import type { Platform } from "@/lib/ai/types";

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

export function buildQualityCheckerPrompt(platform: Platform, output: string): string {
  const rules = PLATFORM_RULES[platform];
  return `You are a quality checker for social media content. Review this ${platform} output and determine if it passes quality standards.

PLATFORM RULES FOR ${platform.toUpperCase()}:
${rules.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}
${rules.maxChars ? `Character limit: ${rules.maxChars} characters maximum` : ""}

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
  items: { platform: Platform; content: string }[]
): string {
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
