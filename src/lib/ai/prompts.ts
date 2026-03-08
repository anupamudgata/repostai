import type { Platform, OutputLanguage } from "@/types";

/** Research-backed best practices (from high-performing posts). Injected into prompts so the model follows proven patterns. */
const BEST_PRACTICES: Record<Platform, string> = {
  linkedin: `BEST PRACTICES (from high-performing LinkedIn posts): First 210 characters are visible before "See more" — 60–70% never click; hook must work in that space. Optimal length 1,300–1,900 characters (47% higher engagement). Use line breaks between thoughts; sentences under 12 words perform better. Open with a number, contrarian take, story, or question. List posts and how-to formats get strong engagement. End with a clear CTA.`,

  twitter_thread: `BEST PRACTICES (from high-performing threads): First tweet drives 80%+ of engagement — make it a cliffhanger or bold claim. Threads of 5–7 tweets perform best. Numbered format (1/, 2/) increases completion. Each tweet under 280 chars; one idea per tweet. End with summary + CTA or question. Questions in the first tweet boost replies.`,

  twitter_single: `BEST PRACTICES (from high-performing tweets): Tweets with a clear point or question get more engagement. Strong verbs and specificity beat vague claims. 1–2 hashtags max; overloading reduces reach. Optimal length 100–280; too short can feel incomplete.`,

  instagram: `BEST PRACTICES (from high-performing captions): First 125 characters show before "...more" — this line decides if they expand; use a scroll-stopping hook (teaser, bold claim, or question). Shorter captions (under 30 words) often get higher engagement; for stories/tutorials longer is OK. Line breaks and spacing increase readability. Clear CTA (comment, save, share) improves engagement.`,

  facebook: `BEST PRACTICES (from high-performing Facebook posts): Questions and "how-to" openings get more comments. Short paragraphs (2–3 sentences) and line breaks improve reach. Native, conversational tone beats corporate. Strong image suggestion in copy helps. CTA at the end.`,

  email: `BEST PRACTICES (from high-performing newsletters): Subject line drives 50%+ of opens — be specific and curiosity-driven; avoid generic words. Front-load the value in the first sentence. One main idea per email. Scannable (short sentences, one CTA).`,

  reddit: `BEST PRACTICES (from high-performing Reddit posts): Title is critical — descriptive and value-focused. Authentic, helpful tone; no marketing speak. Real insights and specifics get upvotes. Ending with a question drives comments.`,
};

/** Short structure examples (tone + format). Model uses these as in-context "training" without fine-tuning. */
const STRUCTURE_EXAMPLES: Record<Platform, string> = {
  linkedin: `Example structure: [Hook in first 1–2 lines] → [Context or story in short paras] → [Key insight or lesson] → [CTA: What do you think? / Try this. / Save this.] → [3–5 hashtags]`,

  twitter_thread: `Example structure: 1/ [Hook — bold claim or question]. 2/ [First point]. 3/ [Second point]. … Last/ [Summary + CTA]. Each line <280 chars.`,

  twitter_single: `Example structure: One punchy sentence with a clear takeaway or question. Optional 1–2 hashtags at end. Max 280 chars.`,

  instagram: `Example structure: [First line = hook, <125 chars] → [2–3 short paras with line breaks] → [Visual hint: …] → [CTA] → [blank line] → [12–20 mixed hashtags, no duplicates].`,

  facebook: `Example structure: [Question or relatable hook] → [2–3 short paragraphs] → [CTA or question]. Conversational; light emojis OK.`,

  email: `Example structure: Subject: [Specific, curiosity-driven, not generic] — Then first paragraph: hook + key takeaway in 2–4 sentences. Transition to "Read more" or main content.`,

  reddit: `Example structure: Title: [Clear, descriptive]. Body: [Genuine value, short paragraphs]. End with [Question to spark discussion]. No hype, no hashtags.`,
};

const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  linkedin: `Write a LinkedIn post. Use a strong hook in the first line (first 210 chars are critical — most won't click "See more"). 
Break into short paragraphs (1-2 sentences each); use line breaks. Keep sentences under 12 words where possible. 
Aim for 1,300–1,900 characters for strong engagement. Include a clear call-to-action at the end. 
Add 3-5 relevant hashtags at the bottom — each only once, no duplicates. Max 3000 characters.`,

  twitter_thread: `Write a Twitter/X thread of 4-7 tweets (5–7 performs best). 
First tweet must be a compelling hook that makes people want to read more — it drives most engagement. 
Each tweet MUST be under 280 characters. Number them (1/, 2/, etc.). End with summary + CTA. 
Use 1-2 hashtags total in the thread if relevant; never repeat the same hashtag.`,

  twitter_single: `Write a single Twitter/X post. MUST be under 280 characters — strict limit. 
Make it punchy, direct, and engaging. Include 1-2 relevant hashtags if space allows; no duplicate hashtags. 
Use strong verbs and create curiosity.`,

  instagram: `Write an Instagram caption. First line is critical — only 125 characters show before "...more"; use a scroll-stopping hook. 
Use short paragraphs with line breaks. Include a call-to-action (comment, save, share). 
Add a line "[Visual hint: ...]" suggesting what the image or carousel should show (e.g. key quote, before/after, step-by-step). 
Hashtag strategy: 12-20 hashtags at the end — mix 3-5 broad, 5-8 niche, 2-4 branded. Never use the same hashtag twice. Max 2200 characters.`,

  facebook: `Write a Facebook post. Use a conversational, friendly tone. 
Start with a question or hook. Keep paragraphs short (2-3 sentences). Include a call-to-action. Emojis are okay but don't overdo it. 
If using hashtags, use 2-5 and do not repeat any.`,

  email: `Write an email newsletter intro paragraph (3-5 sentences). 
Subject line: Write a SPECIFIC, curiosity-driven subject line at the top (e.g. "The one metric that doubled our signups"). 
Avoid generic subjects like "Newsletter", "Update", "This week's digest". 
The intro should hook the reader and summarize the key takeaway. Include a transition sentence to the main content.`,

  reddit: `Write a Reddit post. Use a clear, descriptive title. 
Write in a genuine, non-promotional tone — Reddit users hate marketing speak. 
Provide real value and insights. Structure with short paragraphs. End with a question to encourage discussion. No hashtags, no emojis.`,
};

const LANGUAGE_INSTRUCTIONS: Record<OutputLanguage, string> = {
  en: "",
  hi: `
CRITICAL LANGUAGE INSTRUCTION: Write ALL output content in Hindi (हिन्दी) using Devanagari script.
- Use natural, conversational Hindi — not overly formal or Sanskritized
- Mix in commonly used English words where natural (e.g., "content", "post", "share") — this is how real Hindi speakers write on social media
- Hashtags can be in English or Hindi, whichever is more discoverable
- Maintain the same platform-specific formatting rules (hooks, CTAs, threads, etc.)
- The JSON keys must remain in English, only the content values should be in Hindi`,

  es: `
CRITICAL LANGUAGE INSTRUCTION: Write ALL output content in Spanish (Español).
- Use natural, conversational Latin American Spanish (not overly formal Castilian)
- Use "tú" form for informal platforms (Twitter, Instagram, Reddit) and "usted" for professional ones (LinkedIn, Email)
- Hashtags can be in Spanish or English, whichever is more discoverable for the topic
- Maintain the same platform-specific formatting rules (hooks, CTAs, threads, etc.)
- The JSON keys must remain in English, only the content values should be in Spanish`,
};

export function buildRepurposePrompt(
  content: string,
  platforms: Platform[],
  brandVoice?: string,
  outputLanguage: OutputLanguage = "en"
): string {
  const platformSections = platforms
    .map(
      (platform) =>
        `### ${platform.toUpperCase()}\n${BEST_PRACTICES[platform]}\n\n${STRUCTURE_EXAMPLES[platform]}\n\nInstructions: ${PLATFORM_INSTRUCTIONS[platform]}`
    )
    .join("\n\n");

  const voiceInstruction = brandVoice
    ? `\n\nIMPORTANT - BRAND VOICE: Match this writing style closely. Here are examples of the user's writing:\n---\n${brandVoice}\n---\nMimic their tone, vocabulary, sentence structure, and personality. The output should sound like THEM, not like AI.`
    : "";

  const languageInstruction = LANGUAGE_INSTRUCTIONS[outputLanguage];

  return `You are a world-class content strategist trained on what actually works. Your job is to repurpose the following content into platform-specific posts that follow proven best practices (engagement, length, and structure patterns from high-performing posts on each platform).

RULES:
- Each output must feel like it was written specifically for that platform
- Preserve the core message and key insights from the original content
- Do NOT just copy-paste — adapt tone, format, and structure for each platform
- Make every post engaging and actionable
- Never use generic filler phrases like "In today's fast-paced world"
- HASHTAGS: Never use the same hashtag more than once in a single post. No redundant or repeated hashtags.
- Respect each platform's character limits strictly (e.g. Twitter 280 per tweet, LinkedIn 3000, Instagram caption 2200).${languageInstruction}${voiceInstruction}

ORIGINAL CONTENT:
---
${content}
---

Generate content for each platform below. Return ONLY a JSON object with platform names as keys and generated content as values. No markdown, no explanation — just the JSON.

${platformSections}

Return format:
{
  "${platforms[0]}": "generated content here",
  ...
}`;
}
