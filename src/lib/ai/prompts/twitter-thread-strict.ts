// src/lib/ai/prompts/twitter-thread-strict.ts
// FIX #8: Enforce 280 char limit — AI still sometimes exceeds it
// Two-layer fix: (1) stricter prompt, (2) post-processing that truncates/splits

// ── Layer 1: Stricter prompt ─────────────────────────────────────────────────
import type { ContentBrief, Language } from "@/lib/ai/types";

const LANGUAGE_INSTRUCTION: Record<Language, string> = {
  en: "Write in English.",
  hi: "Write entirely in Hindi (हिन्दी).",
  es: "Write entirely in Spanish.",
  pt: "Write entirely in Portuguese.",
  fr: "Write entirely in French.",
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

🚨 HARD RULE — THIS IS NON-NEGOTIABLE:
Every single tweet MUST be 270 characters or fewer (counted including spaces and punctuation).
Before writing each tweet, count the characters mentally.
If a tweet would exceed 270 chars, split it into two tweets or cut words.
A tweet that exceeds 280 chars will BREAK Twitter's API. Do not let this happen.

THREAD RULES:
1. Tweet 1 (HOOK): Must work as a standalone tweet. End with 🧵 or "Thread:". MAX 260 chars.
2. Tweets 2–N (BODY): Number them "2/" "3/" etc. Each delivers ONE single idea. MAX 270 chars.
3. Final tweet (CLOSE): Summarise the core insight + CTA. MAX 270 chars.
4. Minimum 5 tweets. Maximum 8 tweets. No filler tweets.

CHARACTER COUNTING TIP:
A tweet of 270 chars looks like this example (count manually):
"After 100 cold emails, I learned one thing: personalization beats volume every time. One line of research > three lines of copy. 2/"
(That's ~136 chars — well under limit)

OUTPUT FORMAT — respond with ONLY valid JSON, no preamble:
{
  "tweets": [
    "Tweet 1 text — must be under 260 chars",
    "2/ Tweet 2 text — must be under 270 chars",
    "3/ Tweet 3 text — must be under 270 chars",
    "Final tweet — must be under 270 chars"
  ]
}

${LANGUAGE_INSTRUCTION[language]}`;
}

// ── Layer 2: Post-processing enforcer ────────────────────────────────────────
// Run every tweet through this after generation — catches any that still exceed limit

export function enforceTwitterLimits(tweets: string[]): {
  tweets:    string[];
  hadErrors: boolean;
  errors:    string[];
} {
  const HARD_LIMIT = 280;
  const SAFE_LIMIT = 270;  // our target
  const errors: string[] = [];
  let hadErrors = false;

  const fixed = tweets.map((tweet, index) => {
    if (tweet.length <= HARD_LIMIT) return tweet;

    hadErrors = true;
    errors.push(`Tweet ${index + 1} was ${tweet.length} chars (limit ${HARD_LIMIT})`);

    // Strategy 1: Try removing filler phrases
    let shortened = tweet
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

    // Strategy 2: Hard truncate at last word boundary before limit
    // Keep the tweet number prefix (e.g. "2/") if present
    const prefixMatch = tweet.match(/^(\d+\/\s*)/);
    const prefix      = prefixMatch ? prefixMatch[1] : "";
    const body        = prefixMatch ? tweet.slice(prefix.length) : tweet;

    const maxBodyLen = HARD_LIMIT - prefix.length - 3; // -3 for "..."
    const truncated  = body.slice(0, maxBodyLen).replace(/\s\S*$/, ""); // cut at last word

    return `${prefix}${truncated}...`;
  });

  return { tweets: fixed, hadErrors, errors };
}

// ── Layer 3: Integrate into your platform agent ───────────────────────────────
// In src/lib/ai/repurpose.ts, update the twitter_thread case:
//
// import { buildTwitterThreadPromptStrict } from "@/lib/ai/prompts/twitter-thread-strict";
// import { enforceTwitterLimits }           from "@/lib/ai/prompts/twitter-thread-strict";
//
// After parsing the JSON response for twitter_thread:
//   const { tweets, hadErrors, errors } = enforceTwitterLimits(parsed.tweets ?? []);
//   if (hadErrors) {
//     console.warn("[twitter_thread] Auto-fixed char limit violations:", errors);
//     captureMessage("Twitter thread char limit auto-fixed", "info", { extra: { errors } });
//   }
//   return {
//     platform, content: tweets.join("\n\n"), tweets, charCount: Math.max(...tweets.map(t => t.length)),
//   };
