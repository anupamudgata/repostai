// src/lib/ai/prompts/twitter-thread-strict.ts
// FIX: removed unused SAFE_LIMIT constant
// FIX: changed 'let shortened' to 'const shortened' (never reassigned)

import type { ContentBrief, Language } from "@/lib/ai/types";

const LANGUAGE_INSTRUCTION: Record<Language, string> = {
  en: "Write in English.",
  hi: "Write entirely in Hindi (हिन्दी).",
  es: "Write entirely in Spanish.",
  pt: "Write entirely in Portuguese (Português).",
  fr: "Write entirely in French (Français).",
};

export function buildTwitterThreadPromptStrict(
  brief:      ContentBrief,
  brandVoice: string | null,
  language:   Language
): string {
  return `You are the world's best Twitter/X thread writer.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a Twitter thread of 5-8 tweets.

🚨 HARD RULE — NON-NEGOTIABLE:
Every single tweet MUST be 270 characters or fewer (including spaces and punctuation).
Count characters before writing each tweet.
If a tweet would exceed 270 chars, split it into two tweets or cut words.
A tweet that exceeds 280 chars will BREAK Twitter's API.

THREAD RULES:
1. Tweet 1 (HOOK): Must work as a standalone tweet. End with 🧵 or "Thread:". MAX 260 chars.
2. Tweets 2–N (BODY): Number them "2/" "3/" etc. Each delivers ONE single idea. MAX 270 chars.
3. Final tweet (CLOSE): Summarise the core insight + CTA. MAX 270 chars.
4. Minimum 5 tweets. Maximum 8 tweets. No filler tweets.

OUTPUT FORMAT — respond with ONLY valid JSON, no preamble:
{
  "tweets": [
    "Tweet 1 text — must be under 260 chars",
    "2/ Tweet 2 text — must be under 270 chars",
    "Final tweet — must be under 270 chars"
  ]
}

${LANGUAGE_INSTRUCTION[language]}`;
}

export function enforceTwitterLimits(tweets: string[]): {
  tweets:    string[];
  hadErrors: boolean;
  errors:    string[];
} {
  const HARD_LIMIT = 280;
  const errors: string[] = [];
  let hadErrors = false;

  const fixed = tweets.map((tweet, index) => {
    if (tweet.length <= HARD_LIMIT) return tweet;

    hadErrors = true;
    errors.push(`Tweet ${index + 1} was ${tweet.length} chars (limit ${HARD_LIMIT})`);

    // FIX: use const — this value is never reassigned
    const shortened = tweet
      .replace(/\bvery\b /gi, "")
      .replace(/\breally\b /gi, "")
      .replace(/\bactually\b /gi, "")
      .replace(/\bjust\b /gi, "")
      .replace(/\bbasically\b /gi, "")
      .replace(/\bin order to\b/gi, "to")
      .replace(/\bdue to the fact that\b/gi, "because")
      .replace(/\bat this point in time\b/gi, "now")
      .trim();

    if (shortened.length <= HARD_LIMIT) return shortened;

    // Hard truncate at last word boundary
    const prefixMatch = tweet.match(/^(\d+\/\s*)/);
    const prefix      = prefixMatch ? prefixMatch[1] : "";
    const body        = prefixMatch ? tweet.slice(prefix.length) : tweet;
    const maxBodyLen  = HARD_LIMIT - prefix.length - 3;
    const truncated   = body.slice(0, maxBodyLen).replace(/\s\S*$/, "");

    return `${prefix}${truncated}...`;
  });

  return { tweets: fixed, hadErrors, errors };
}
