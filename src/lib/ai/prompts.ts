import type { Platform, OutputLanguage } from "@/types";
import { buildHindiRepurposeAppend } from "@/lib/prompts/hindi";
import { getRegionalPrompts } from "@/lib/prompts/regional";

/** Research-backed best practices (from high-performing posts). Injected into prompts so the model follows proven patterns. */
const BEST_PRACTICES: Record<Platform, string> = {
  linkedin: `BEST PRACTICES (from high-performing LinkedIn posts): First 210 characters are visible before "See more" — 60–70% never click; hook must work in that space. Optimal length 1,300–1,900 characters (47% higher engagement). Use line breaks between thoughts; sentences under 12 words perform better. Open with a number, contrarian take, story, or question. List posts and how-to formats get strong engagement. End with a clear CTA.`,

  twitter_thread: `BEST PRACTICES (from high-performing threads): First tweet drives 80%+ of engagement — make it a cliffhanger or bold claim. Threads of 5–7 tweets perform best. Numbered format (1/, 2/) increases completion. Each tweet under 280 chars; one idea per tweet. End with summary + CTA or question. Questions in the first tweet boost replies.`,

  twitter_single: `BEST PRACTICES (from high-performing tweets): Tweets with a clear point or question get more engagement. Strong verbs and specificity beat vague claims. 1–2 hashtags max; overloading reduces reach. Optimal length 100–280; too short can feel incomplete.`,

  instagram: `BEST PRACTICES (from high-performing captions): First 125 characters show before "...more" — this line decides if they expand; use a scroll-stopping hook (teaser, bold claim, or question). Shorter captions (under 30 words) often get higher engagement; for stories/tutorials longer is OK. Line breaks and spacing increase readability. Clear CTA (comment, save, share) improves engagement.`,

  facebook: `BEST PRACTICES (from high-performing Facebook posts): Questions and "how-to" openings get more comments. Short paragraphs (2–3 sentences) and line breaks improve reach. Native, conversational tone beats corporate. Strong image suggestion in copy helps. CTA at the end.`,

  email: `BEST PRACTICES (from high-performing newsletters): Subject line drives 50%+ of opens — be specific and curiosity-driven; avoid generic words. Front-load the value in the first sentence. One main idea per email. Scannable (short sentences). Always end with ONE clear CTA (button or link line). When relevant, add subtle urgency (deadline, date, or "this week"). Never truncate — deliver a complete intro that leads to the CTA.`,

  reddit: `BEST PRACTICES (from high-performing Reddit posts): Title is critical — descriptive and value-focused. Authentic, helpful tone; no marketing speak. Real insights and specifics get upvotes. Ending with a question drives comments.`,

  tiktok: `BEST PRACTICES (from high-performing TikTok videos): Hook viewers in the first 1–2 seconds with a bold statement, question, or pattern interrupt. Keep scripts tight and visual — describe what’s on screen alongside dialogue. Use short sentences and natural, spoken language. End with a clear CTA (follow, comment, save, click link in bio).`,

  whatsapp_status: `BEST PRACTICES (from high-performing WhatsApp Status posts): Keep text short, clear, and personal. Avoid heavy formatting. Use 1–2 concise lines plus an optional link or CTA. Emojis are okay in moderation. Remember people skim quickly.`,
};

/** Short structure examples (tone + format). Model uses these as in-context "training" without fine-tuning. */
const STRUCTURE_EXAMPLES: Record<Platform, string> = {
  linkedin: `Example structure: [Hook in first 1–2 lines] → [Context or story in short paras] → [Key insight or lesson] → [CTA: What do you think? / Try this. / Save this.] → [3–5 hashtags]`,

  twitter_thread: `Example structure: 1/ [Hook — bold claim or question]. 2/ [First point]. 3/ [Second point]. … Last/ [Summary + CTA]. Each line <280 chars.`,

  twitter_single: `Example structure: One punchy sentence with a clear takeaway or question. Optional 1–2 hashtags at end. Max 280 chars.`,

  instagram: `Example structure: [First line = hook, <125 chars] → [2–3 short paras with line breaks] → [Visual hint: …] → [CTA] → [blank line] → [12–20 mixed hashtags, no duplicates].`,

  facebook: `Example structure: [Question or relatable hook] → [2–3 short paragraphs] → [CTA or question]. Conversational; light emojis OK.`,

  email: `Example structure: Subject: [Specific, curiosity-driven, not generic] — Body: hook + key takeaway in 2–4 sentences. Transition to main content. Closing: one clear CTA line (e.g. [Button: Read the full post →] or "Link: ..."). If time-sensitive, add one urgency line (e.g. "Offer ends Friday" or "Join by March 15").`,

  reddit: `Example structure: Title: [Clear, descriptive]. Body: [Genuine value, short paragraphs]. End with [Question to spark discussion]. No hype, no hashtags.`,

  tiktok: `Example structure: [Hook line said on camera] → [1–3 short points or story beats] → [CTA said on camera, e.g. “Follow for more”, “Save this for later”, or “Link in bio for details”]. Include brief bracketed notes for visuals when helpful.`,

  whatsapp_status: `Example structure: [1–2 short lines of text] → [Optional link or CTA]. Keep it scannable and friendly.`,
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

  email: `Write a COMPLETE email newsletter section (do not truncate).
Subject line: Write a SPECIFIC, curiosity-driven subject line at the top (e.g. "The one metric that doubled our signups"). Avoid generic subjects like "Newsletter", "Update", "This week's digest".
Body: 3–6 sentences — hook the reader, summarize the key takeaway, and transition to the main content.
Closing CTA: End with ONE clear call-to-action — either a button line (e.g. "[CTA Button: Read the full post →]" or "[Button: Claim your spot →]") or a clear link line (e.g. "Read more: [link placeholder]"). The reader must know exactly what to do next.
Urgency (when appropriate): If the content has a deadline, event date, or time-sensitive offer, add one short urgency line (e.g. "Offer ends March 15" or "Only 10 spots left"). Do not force urgency if the topic is evergreen.`,

  reddit: `Write a Reddit post. Use a clear, descriptive title. 
Write in a genuine, non-promotional tone — Reddit users hate marketing speak. 
Provide real value and insights. Structure with short paragraphs. End with a question to encourage discussion. No hashtags, no emojis.`,

  tiktok: `Write a TikTok video script, not a blog post. 
Start with a hook line that can be spoken in under 3 seconds. 
Use 3–7 very short spoken lines total. You may optionally include brief bracketed stage directions like [Text on screen: ...] or [B-roll of ...]. 
Make it feel like a real creator talking to camera. End with a natural CTA (e.g. follow, comment, save, or check link in bio).`,

  whatsapp_status: `Write a short WhatsApp Status text update. 
Use 1–3 short lines max. Keep it personal and conversational. 
You may include one link or CTA if relevant. Avoid cluttered formatting or long paragraphs. Max ~700 characters.`,
};

const LANGUAGE_INSTRUCTIONS: Record<OutputLanguage, string> = {
  en: "",
  hi: `
OUTPUT LANGUAGE: Hindi mode = natural HINGLISH (see HINDI MASTER BLOCK below).
- JSON keys stay English (platform ids). Each value = full post text in natural Indian Hinglish.
- Do not use stiff Shuddh Hindi or literal translations; do not output only English.`,

  mr: `
OUTPUT LANGUAGE: Marathi mode = natural MARATHLISH (see REGIONAL MASTER BLOCK below).
- JSON keys stay English. Each value = full post text in natural Marathlish (Marathi + English mix).
- Use Devanagari for Marathi words. English tech/platform terms stay in Latin script.`,

  bn: `
OUTPUT LANGUAGE: Bengali mode = natural BENGLISH (see REGIONAL MASTER BLOCK below).
- JSON keys stay English. Each value = full post text in natural Benglish (Bengali + English mix).
- Use Bengali script for Bengali words. English tech/platform terms stay in Latin script.`,

  te: `
OUTPUT LANGUAGE: Telugu mode = natural TENGLISH (see REGIONAL MASTER BLOCK below).
- JSON keys stay English. Each value = full post text in natural Tenglish (Telugu + English mix).
- Use Telugu script for Telugu words. English tech/platform terms stay in Latin script.`,

  kn: `
OUTPUT LANGUAGE: Kannada mode = natural KANGLISH (see REGIONAL MASTER BLOCK below).
- JSON keys stay English. Each value = full post text in natural Kanglish (Kannada + English mix).
- Use Kannada script for Kannada words. English tech/platform terms stay in Latin script.`,

  or: `
OUTPUT LANGUAGE: Odia mode = natural ODIANGLISH (see REGIONAL MASTER BLOCK below).
- JSON keys stay English. Each value = full post text in natural Odianglish (Odia + English mix).
- Use Odia script for Odia words. English tech/platform terms stay in Latin script.`,

  pa: `
OUTPUT LANGUAGE: Punjabi mode = natural PUNGLISH (see REGIONAL MASTER BLOCK below).
- JSON keys stay English. Each value = full post text in natural Punglish (Punjabi + English mix).
- Use Gurmukhi script for Punjabi words. English tech/platform terms stay in Latin script.`,

  es: `
CRITICAL LANGUAGE INSTRUCTION: Write ALL output content in Spanish (Español).
- Use natural, conversational Latin American Spanish (not overly formal Castilian)
- Use "tú" form for informal platforms (Twitter, Instagram, Reddit, TikTok, WhatsApp) and "usted" for professional ones (LinkedIn, Email)
- Hashtags can be in Spanish or English, whichever is more discoverable for the topic
- Maintain the same platform-specific formatting rules (hooks, CTAs, threads, etc.)
- The JSON keys must remain in English, only the content values should be in Spanish`,

  pt: `
CRITICAL LANGUAGE INSTRUCTION: Write ALL output content in Portuguese (Português).
- Use natural, conversational Brazilian Portuguese
- Use "você" form; avoid overly formal constructions
- Hashtags can be in Portuguese or English, whichever is more discoverable for the topic
- Maintain the same platform-specific formatting rules (hooks, CTAs, threads, etc.)
- The JSON keys must remain in English, only the content values should be in Portuguese`,

  fr: `
CRITICAL LANGUAGE INSTRUCTION: Write ALL output content in French (Français).
- Use natural, conversational international French (not overly formal)
- Use "tu" for informal platforms (Twitter, Instagram, Reddit, TikTok, WhatsApp) and "vous" for professional ones (LinkedIn, Email)
- Hashtags can be in French or English, whichever is more discoverable for the topic
- Maintain the same platform-specific formatting rules (hooks, CTAs, threads, etc.)
- The JSON keys must remain in English, only the content values should be in French`,
};

const CONTENT_ANGLE_INSTRUCTIONS: Record<string, string> = {
  insight: "CONTENT ANGLE: Generate as an INSIGHT POST — lead with a key takeaway, lesson learned, or 'aha' moment. Focus on the one thing the reader should remember.",
  story: "CONTENT ANGLE: Generate as a STORY POST — use a narrative format with a personal anecdote, before/after, or journey. Hook with the story, land with the lesson.",
  howto: "CONTENT ANGLE: Generate as a HOW-TO — step-by-step, tutorial, or actionable guide. Make it practical and easy to follow.",
  contrarian: "CONTENT ANGLE: Generate as a CONTRARIAN TAKE — challenge common beliefs, question the status quo, or offer an unpopular-but-defensible opinion. Be bold but reasoned.",
  listicle: "CONTENT ANGLE: Generate as a LISTICLE — numbered list format (e.g. 5 lessons, 7 tips, 3 mistakes). Each point should be scannable and standalone.",
};

/** Viral hook style — the first line drives 80% of engagement. Must stop the scroll. */
const HOOK_MODE_INSTRUCTIONS: Record<string, string> = {
  pattern_interrupt: "VIRAL HOOK (first line): Use a PATTERN INTERRUPT — start with a surprising stat or bold claim that contradicts common belief (e.g. '95% of algo traders do this wrong...', 'Nobody talks about this...'). Make the reader stop scrolling.",
  story: "VIRAL HOOK (first line): Use a STORY HOOK — open with a personal loss, win, or dramatic moment (e.g. 'I lost $3,200 in 3 hours. Here's what happened...', 'I failed 3 times before this worked.'). Create curiosity and emotional pull.",
  statistic: "VIRAL HOOK (first line): Use a STATISTIC HOOK — lead with a surprising number or data point (e.g. '62% of creators burn out. I found the fix.', 'Only 3% of people do this.'). Numbers create credibility and curiosity.",
  fomo: "VIRAL HOOK (first line): Use a FOMO HOOK — start with social proof or urgency (e.g. 'Everyone's talking about this strategy. Here's why.', 'Your competitors are already doing this.'). Make them feel they're missing out.",
  controversy: "VIRAL HOOK (first line): Use a CONTROVERSY HOOK — challenge a popular practice or belief (e.g. 'Stop paper trading. It's wasting your time.', 'Most advice on X is wrong.'). Be bold and direct.",
  sneak_peek: "VIRAL HOOK (first line): Use a SNEAK PEEK HOOK — tease results or a discovery (e.g. 'I spent 30 days testing this. Results shocked me.', 'I tried this for a week. Here's what changed.'). Create curiosity about the outcome.",
};

export type AuthenticityTuning = {
  humanizationLevel?: string;
  imperfectionMode?: boolean;
  personalStoryInjection?: boolean;
};

export function buildRepurposePrompt(
  content: string,
  platforms: Platform[],
  brandVoice?: string,
  outputLanguage: OutputLanguage = "en",
  userIntent?: string,
  contentAngle?: string,
  hookMode?: string,
  authenticityTuning?: AuthenticityTuning
): string {
  const intentInstruction = userIntent?.trim()
    ? `\n\nUSER'S GOAL FOR THIS PIECE: "${userIntent.trim()}". Prioritize this when generating — the output should match what the user wants (e.g. more engagement, more casual, emphasize a specific angle).`
    : "";

  const angleInstruction =
    contentAngle && contentAngle !== "default" && CONTENT_ANGLE_INSTRUCTIONS[contentAngle]
      ? `\n\n${CONTENT_ANGLE_INSTRUCTIONS[contentAngle]}`
      : "";

  const hookInstruction =
    hookMode && hookMode !== "default" && HOOK_MODE_INSTRUCTIONS[hookMode]
      ? `\n\n${HOOK_MODE_INSTRUCTIONS[hookMode]}`
      : "";

  const platformSections = platforms
    .map(
      (platform) =>
        `### ${platform.toUpperCase()}\n${BEST_PRACTICES[platform]}\n\n${STRUCTURE_EXAMPLES[platform]}\n\nInstructions: ${PLATFORM_INSTRUCTIONS[platform]}`
    )
    .join("\n\n");

  const voiceInstruction = brandVoice
    ? `\n\nCRITICAL - BRAND VOICE (must apply to every platform): The user provided writing samples below. ALL outputs MUST sound like this brand — same tone, vocabulary, sentence length, and personality. Do not fall back to generic AI voice. If the samples are casual, keep outputs casual; if professional, keep professional. Here are the examples:\n---\n${brandVoice}\n---`
    : "";

  let authenticityInstruction = "";
  if (authenticityTuning) {
    const parts: string[] = [];
    if (authenticityTuning.humanizationLevel && authenticityTuning.humanizationLevel !== "professional") {
      if (authenticityTuning.humanizationLevel === "casual") {
        parts.push("HUMANIZATION: Write in a CASUAL tone — friendly, conversational, approachable. Use everyday language, contractions, and a relaxed vibe.");
      } else if (authenticityTuning.humanizationLevel === "raw") {
        parts.push("HUMANIZATION: Write in a RAW/UNFILTERED tone — direct, authentic, no corporate polish. Say it like you mean it. Bold and unfiltered.");
      }
    }
    if (authenticityTuning.imperfectionMode) {
      parts.push("IMPERFECTION MODE: Intentionally add human imperfections — occasional lowercase starts, sentence fragments, minor typos (e.g. 'tbh', 'gonna'), casual abbreviations. Example: 'tbh i used to think...' instead of 'To be honest, I previously believed...'. Makes it feel real, not AI-polished.");
    }
    if (authenticityTuning.personalStoryInjection) {
      parts.push("PERSONAL STORY INJECTION: Weave in a relevant personal anecdote or story based on the topic. Example: Topic about algo trading → 'I remember debugging at 3 AM when my first bot lost $3,200...'. Make it specific, relatable, and tied to the content. One short anecdote per post.");
    }
    if (parts.length > 0) {
      authenticityInstruction = `\n\nAUTHENTICITY TUNING (apply to every platform):\n${parts.join("\n")}`;
    }
  }

  let languageInstruction: string;
  if (outputLanguage === "hi") {
    languageInstruction = `${LANGUAGE_INSTRUCTIONS.hi}\n\n${buildHindiRepurposeAppend(platforms)}`;
  } else {
    const regional = getRegionalPrompts(outputLanguage);
    if (regional) {
      languageInstruction = `${LANGUAGE_INSTRUCTIONS[outputLanguage]}\n\n${regional.buildRepurposeAppend(platforms)}`;
    } else {
      languageInstruction = LANGUAGE_INSTRUCTIONS[outputLanguage];
    }
  }

  return `You are a world-class content strategist trained on what actually works. Your job is to repurpose the following content into platform-specific posts that follow proven best practices (engagement, length, and structure patterns from high-performing posts on each platform).

RULES:
- TONE PRESERVATION: Preserve the original content's tone. If the source is casual, keep outputs casual; if technical, keep technical; if humorous, keep humor. Do not default to generic corporate or cheerful tone. The output should feel like the same author wrote it for each platform.
- PLATFORM UNIQUENESS: Each output must feel written specifically for that platform — different format and structure, but the same voice and tone as the original (and brand voice if provided).
- Preserve the core message and key insights from the original content. Do not dilute or genericize.
- Make every post engaging and actionable. Avoid generic filler ("In today's fast-paced world", "In conclusion", "Hope you enjoyed").
- SENSITIVE TOPICS: Match tone to content gravity. For serious, somber, or controversial topics (e.g. geopolitical, tragedy, crisis), use an appropriate tone — respectful and measured. Do not apply a cheerful or salesy tone to serious subject matter.
- HASHTAGS: Use relevant, topic-specific hashtags. Mix broad and niche; no filler or repeated hashtags. Never use the same hashtag more than once in a single post. Prefer hashtags that fit the topic rather than generic #marketing #growth.
- Respect each platform's character limits strictly (e.g. Twitter 280 per tweet, LinkedIn 3000, Instagram caption 2200). Do not truncate; deliver complete outputs.${angleInstruction}${hookInstruction}${authenticityInstruction}${intentInstruction}${languageInstruction}${voiceInstruction}

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
