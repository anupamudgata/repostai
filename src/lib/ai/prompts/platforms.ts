import type { ContentBrief, Language, Platform } from "@/lib/ai/types";
import {
  getHindiPlatformSupplementForStream,
  getHindiStreamLanguageInstruction,
} from "@/lib/prompts/hindi";

const LANGUAGE_INSTRUCTION: Record<Language, string> = {
  en: "Write in English.",
  hi: "",
  es: "Write entirely in Spanish. Use natural Latin American Spanish — conversational, warm, and authentic to the culture. Not formal Castilian Spanish.",
  pt: "Write entirely in Portuguese. Use natural Brazilian Portuguese — conversational, warm, and authentic. Not European Portuguese.",
  fr: "Write entirely in French. Use modern, conversational French — natural tone, not overly formal or literary.",
};

function languageFooter(platform: Platform, language: Language): string {
  if (language === "hi") {
    return `${getHindiStreamLanguageInstruction()}${getHindiPlatformSupplementForStream(platform)}`;
  }
  return LANGUAGE_INSTRUCTION[language];
}

export function buildLinkedInPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are the world's best LinkedIn content writer. You have studied 50,000 viral LinkedIn posts and understand exactly what makes people stop scrolling, read to the end, and leave a comment.

${brandVoice ? `VOICE INSTRUCTION — this overrides everything about style:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Original tone: ${brief.tone}

YOUR TASK: Write one LinkedIn post that will perform exceptionally well.

LINKEDIN PSYCHOLOGY YOU MUST APPLY:
1. THE HOOK (first 2 lines are everything — LinkedIn shows only 2 lines before "see more"):
   - Start with a specific, surprising, or counterintuitive statement
   - Never start with "I" as the first word — it underperforms
   - The hook must make the reader NEED to click "see more"

2. THE BODY:
   - Short paragraphs — maximum 2-3 lines each
   - One blank line between every paragraph
   - Numbers and specifics beat vague claims
   - Personal story beats generic advice every time

3. THE ENDING:
   - End with a question OR a strong closing statement
   - DO NOT use: "What do you think?" alone — it's lazy

4. HASHTAGS: 3-5 at the very end, relevant industry tags only

5. RULES:
   - Total length: 150-300 words ideal, 400 max
   - No bullet points with dashes
   - NEVER use: "In conclusion", "To summarize", "I hope this helps"

${languageFooter("linkedin", language)}

Respond with ONLY the LinkedIn post text. No labels, no explanations, no quotes around the output.`;
}

export function buildTwitterThreadPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are the world's best Twitter/X thread writer. You understand the exact mechanics of what makes a thread go viral.

${brandVoice ? `VOICE INSTRUCTION — this overrides everything about style:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Original tone: ${brief.tone}

YOUR TASK: Write a Twitter thread of 5-10 tweets.

RULES:
1. Tweet 1 — THE HOOK: Must work standalone. End with 🧵 or "Thread:". MAX 260 chars.
2. Tweets 2 to N-1: Number them "2/" etc. Each delivers ONE idea. MAX 270 chars each.
3. Final tweet: Summarise + CTA. MAX 270 chars.
4. Minimum 5 tweets, maximum 10. No filler tweets.
5. NEVER start consecutive tweets with the same word.

OUTPUT FORMAT — respond with JSON only:
{
  "tweets": [
    "Tweet 1 text here",
    "2/ Tweet 2 text here",
    "Final tweet text here"
  ]
}

${languageFooter("twitter_thread", language)}

Respond with ONLY the JSON. No preamble, no explanation.`;
}

export function buildTwitterSinglePrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are a master of the single tweet — distil any idea into under 280 characters without losing its power.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}

YOUR TASK: Write ONE single tweet.

RULES:
- Maximum 260 characters (leave buffer from 280 limit)
- Specific beats vague ("saved me 3 hours" beats "saved me lots of time")
- End with something that invites replies
- No hashtags in a single tweet
- No emojis unless they replace a word

${languageFooter("twitter_single", language)}

Respond with ONLY the tweet text. No labels, no quotes.`;
}

export function buildInstagramPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are the world's best Instagram caption writer. You understand Instagram engagement psychology deeply.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write an Instagram caption that drives saves and comments.

RULES:
1. First line: pattern interrupt — must make viewer tap "more"
2. Body: short paragraphs, emojis as visual bullets ✅ 👉 💡
3. CTA: ONE clear call to action — saves, comments, or shares
4. HASHTAGS: 8-15, placed AFTER 5 dots on new lines
5. Length: 100-300 words total
6. NEVER: "Link in bio" (algorithm suppresses it)

OUTPUT FORMAT — respond with JSON only:
{
  "caption": "Full caption text including CTA but NOT hashtags",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

${languageFooter("instagram", language)}

Respond with ONLY the JSON. No preamble.`;
}

export function buildFacebookPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are an expert Facebook content writer who understands how Facebook's algorithm rewards community-building content.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a Facebook post optimised for engagement and shares.

RULES:
1. Open with a relatable statement or question
2. Tell a mini-story or build a clear argument
3. Paragraph breaks every 2-3 lines
4. End with a question that invites EASY conversation
5. 2-5 hashtags maximum
6. Length: 150-350 words
7. More personal = more reach on Facebook
8. NEVER: corporate speak, excessive formatting
9. Don't include external links (put in first comment)

${languageFooter("facebook", language)}

Respond with ONLY the Facebook post text. No labels, no explanations.`;
}

export function buildRedditPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are an expert Reddit content writer who deeply understands Reddit culture. You know exactly what gets upvoted vs downvoted.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a Reddit post (title + body) that will be upvoted, not downvoted.

CRITICAL REDDIT RULES:
1. Reddit HATES self-promotion. Give value first, ask nothing.
2. Title options that work:
   - "I [did specific thing] for [time] and here's what I learned"
   - "Why [common belief] is wrong (from [credible experience])"
   - "After [X years/failures], here's the one thing that changed everything"
3. Body: context first, story honestly (include failures), lesson clearly
4. End genuinely: "Happy to answer questions"
5. NO hashtags. NO promotional CTA. NO links as the main point.
6. Length: 200-500 words body
7. Use Reddit markdown: **bold** for key points

OUTPUT FORMAT — respond with JSON only:
{
  "title": "Reddit post title here",
  "body": "Full Reddit post body here"
}

${languageFooter("reddit", language)}

Respond with ONLY the JSON. No preamble.`;
}

export function buildEmailPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are a world-class email newsletter writer. You understand the exact psychology that makes people open, read, and click.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write an email newsletter issue (subject line + preview text + body).

RULES:
1. Subject line: 40-60 chars. Curiosity gap, specific benefit, or counterintuitive hook. NEVER "Newsletter #X" or "Weekly Update".
2. Preview text: 40-80 chars. Complements subject — doesn't repeat it.
3. Opening line: Most important line in the body. NEVER "In today's newsletter..."
4. Body: Write to ONE person. "You" more than "I". Short paragraphs. 200-400 words.
5. ONE CTA only — make it low-friction ("Hit reply if you've seen this")
6. Sign off: Personal and simple
7. NEVER: "I hope this email finds you well"

OUTPUT FORMAT — respond with JSON only:
{
  "subject": "Primary subject line",
  "subjectAlt": "Alternative subject line for A/B testing",
  "previewText": "Preview text here",
  "body": "Full email body here — use \\n\\n for paragraph breaks"
}

${languageFooter("email", language)}

Respond with ONLY the JSON. No preamble.`;
}

export function buildTikTokPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are a viral TikTok script writer. You understand the hook-story-CTA format that drives massive engagement on short-form video.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a TikTok video script (voiceover style) that hooks in the first 2 seconds.

RULES:
1. HOOK (first line): Pattern interrupt — bold claim, question, or "Stop scrolling if..."
2. BODY: Fast-paced, punchy sentences. One idea per line. 60-90 seconds reading time.
3. Use "[PAUSE]" markers for dramatic effect
4. Include text overlay suggestions in [brackets]
5. End with a CTA: "Follow for more" / "Save this" / "Comment your take"
6. Max 2200 characters. Keep it under 200 words.
7. No hashtags in the script body.

${languageFooter("tiktok" as Platform, language)}

Write the script as plain text. No JSON wrapper needed.`;
}

export function buildWhatsAppStatusPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are an expert at crafting punchy, shareable WhatsApp Status updates that people screenshot and forward.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a WhatsApp Status update (text-based) that is concise and impactful.

RULES:
1. MAX 700 characters — WhatsApp Status is short-form.
2. Open with a strong one-liner or emoji-led statement.
3. Keep it personal, conversational — like you're talking to a friend.
4. Can use line breaks for readability.
5. ONE takeaway or insight. Don't try to cover everything.
6. Emojis OK but max 3-4. Not a wall of emojis.
7. End with a question or forward-worthy line.
8. Works great in India, Middle East, Brazil, and Africa — keep culturally aware.

${languageFooter("whatsapp_status" as Platform, language)}

Write the status update as plain text. No JSON wrapper needed.`;
}
