import type { ContentBrief, Language, Platform } from "@/lib/ai/types";
import {
  getHindiPlatformSupplementForStream,
  getHindiStreamLanguageInstruction,
} from "@/lib/prompts/hindi";
import { getRegionalPrompts } from "@/lib/prompts/regional";

const LANGUAGE_INSTRUCTION: Record<Language, string> = {
  en: "Write in English.",
  hi: "",
  mr: "",
  bn: "",
  te: "",
  kn: "",
  or: "",
  pa: "",
  es: "Write entirely in Spanish. Use natural Latin American Spanish — conversational, warm, and authentic to the culture. Not formal Castilian Spanish.",
  pt: "Write entirely in Portuguese. Use natural Brazilian Portuguese — conversational, warm, and authentic. Not European Portuguese.",
  fr: "Write entirely in French. Use modern, conversational French — natural tone, not overly formal or literary.",
};

const HINDI_PLATFORM_OVERRIDES: Partial<Record<Platform, string>> = {
  linkedin: `HINDI-SPECIFIC LINKEDIN RULES (override English defaults where they conflict):
- "Never start with I" does NOT apply — Hindi first-person "मैंने" or "मेरा" is natural
- End with Hindi engagement: "आपका अनुभव क्या रहा?", "Comments में बताइए", "क्या आप agree करते हैं?" — NOT "What do you think?"
- Use आप-based professional Hinglish, not stiff Shuddh Hindi
- Indian professional references > Western ones (IIT/IIM, Infosys, Indian startup ecosystem)`,

  twitter_thread: `HINDI-SPECIFIC X THREAD RULES:
- Hook tweet must work in Hinglish — punchy, desi flavor
- "Thread:" or 🧵 is fine in English; numbering "2/", "3/" stays
- Mix conversational Hindi connectors: "बात ये है", "सबसे बड़ी बात", "अब ध्यान से सुनो"`,

  twitter_single: `HINDI-SPECIFIC SINGLE TWEET:
- Under 260 chars including Devanagari (Devanagari chars count as 1 each on Twitter)
- Punchy Hinglish one-liner: observation, hot take, or witty remark
- Indian context when natural: "Monday morning metro vibes" → "Monday सुबह metro में ये realisation आई"`,

  instagram: `HINDI-SPECIFIC INSTAGRAM:

📌 MANDATORY 3-PART STRUCTURE:
1) [HOOK] — Scroll-stopping first line (<125 chars). Use a desi hook formula from below. This line decides if they read or scroll.
2) [SHORT STORY / VALUE] — 3-6 short paras. Relatable story, insight, or value bomb. Energetic, slightly dramatic, filmi energy. Use desi slang naturally.
3) [CTA] — Save/share/comment call in Hindi: "Save करो", "Share करो उस दोस्त को जिसको ज़रूरत है", "Tag करो", "Comment में बताओ" — NEVER English CTAs.

🔥 SCROLL-STOPPING DESI HOOK FORMULAS (rotate, never repeat same style twice):
1. "99% लोग ये गलती करते हैं..." (stat + mistake)
2. "लिख के ले लो — [bold claim]" (guarantee format)
3. "ये सुनकर दिमाग खराब हो जाएगा..." (shock/reveal)
4. "कोई नहीं बोलता ये बात..." (hidden truth)
5. "🚫 ये मत करो अगर [context]" (warning/prohibition)
6. "[Topic] का सबसे बड़ा सच..." (truth-bomb)
7. "मैंने [X] किया और ये हुआ..." (personal result)
8. "3 seconds दो — पूरी game बदल जाएगी" (time-hook)
9. "एक चीज़ जो मुझे पहले बता देते तो..." (regret hook)
10. "बस ये एक trick — और result तगड़ा" (single hack)
11. "Unpopular opinion: [Hindi hot take]" (controversy)
12. "[Number] में से [number] लोग ये नहीं जानते..." (knowledge gap)
13. "रुको — scroll मत करो ❌" (direct interrupt)

💡 TONE: Conversational, ENERGETIC, slightly dramatic — like a popular Indian Reels creator. Not informational, not blog-style, not flat.
- Use desi slang naturally: बवाल, मस्त, तगड़ा, दिमाग खराब, जुगाड़, सॉलिड, पैसा वसूल
- Casual तुम/यार tone for relatability
- Emojis as Hinglish bullets work well (5-8, integrated not dumped)
- Hashtags: mix Hindi + English (#HindiContent #CreatorLife #SocialMedia #ContentCreator)`,

  reddit: `HINDI-SPECIFIC REDDIT:
- Title formulas in Hinglish: "X साल Y करने के बाद ये सीखा" or "Unpopular opinion: [Hindi hot take]"
- "Happy to answer questions" → "कुछ पूछना हो तो बताओ" or just end naturally
- Value-first, no marketing voice — just sound like a helpful desi Redditor`,

  tiktok: `HINDI-SPECIFIC TIKTOK SCRIPT:
- Tone: ENERGETIC, slightly dramatic, filmi energy — sound like a viral Indian creator, not a script reader
- Spoken Hinglish: "सुनो ये ज़रूरी है", "रुको ज़रा", "ये देखो पहले"
- Desi hooks for first 2 seconds: "कोई नहीं बोलता ये...", "ये सुनो पहले...", "3 seconds दो, फिर scroll करना", "रुको — ये मत skip करो", "दिमाग खराब हो जाएगा..."
- Use desi slang naturally: बवाल, तगड़ा, मस्त, दिमाग खराब, जुगाड़
- Structure: [HOOK: scroll-stopper] → [Value/story 15-30 sec] → [Hindi verbal CTA]
- End CTA: "Follow करो", "Save करो", "Comment में बताओ" — Hindi verbal CTAs only`,

  whatsapp_status: `HINDI-SPECIFIC WHATSAPP:
- Ultra short: 3-5 lines max, texting-a-friend vibe
- "DM करो", "Forward करो", "बताओ तुम्हारा experience" — Hindi micro-CTAs
- Zero hashtags, zero links, zero formatting — just punchy Hinglish text`,

  email: `HINDI-SPECIFIC EMAIL:
- Subject line can be Hinglish: curiosity gap in mixed script
- "Hi [Name]," is fine — then switch to warm Hinglish
- Avoid "आशा है यह ईमेल आपको अच्छा लगे" — just start with the hook
- CTA: "Reply करो", "इस link पर जाओ" — natural Hinglish`,
};

function languageFooter(platform: Platform, language: Language): string {
  if (language === "hi") {
    const override = HINDI_PLATFORM_OVERRIDES[platform] ?? "";
    return `${getHindiStreamLanguageInstruction()}${getHindiPlatformSupplementForStream(platform)}${override ? `\n\n${override}` : ""}`;
  }
  const regional = getRegionalPrompts(language);
  if (regional) {
    const override = regional.platformOverrides[platform] ?? "";
    return `${regional.getStreamLanguageInstruction()}${regional.getPlatformSupplementForStream(platform)}${override ? `\n\n${override}` : ""}`;
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
8. COMMERCIAL CTA RULE: If the content does NOT promote a product, service, or offer, do NOT use "Offer ends soon", "Don't miss out", "Limited time", or any e-commerce urgency CTA. For non-commercial content, use engagement CTAs instead ("Hit reply", "Share this", "What do you think?").

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
  return `You are a viral TikTok script writer. You understand the hook-story-CTA format that makes people stop scrolling.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a TikTok video script (talking-head / voiceover style).

CRITICAL RULES:
1. HOOK (first 2 lines): Pattern interrupt that makes people STOP SCROLLING.
   Good hooks (English): "Nobody talks about this..." / "Stop scrolling if you..." / "I tried X for 6 months — here's what happened"
   Good hooks (Hinglish): "कोई नहीं बोलता ये..." / "रुको, ये सुनो पहले..." / "मैंने 6 महीने ये try किया — result देखो"
2. BODY: MAX 5-7 short sentences. One idea per line. Say it out loud — if it takes more than 45-60 seconds, it's too long.
3. Use [TEXT ON SCREEN: ...] for key visual overlays (2-3 max).
4. Use [PAUSE] sparingly for dramatic effect (1-2 max).
5. Each line should be spoken out loud — write for the EAR, not the eye.
6. End with ONE clear verbal CTA: "Follow for more" / "Save this" / "Comment below".
7. NO hashtags in the script. NO numbered lists. NO bullet points.
8. Keep under 150 words total.
9. Energy should feel like you're telling a friend something exciting, not reading a blog post.

${languageFooter("tiktok" as Platform, language)}

Write ONLY the script. No JSON. No title. No hashtags.`;
}

export function buildWhatsAppStatusPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are an expert at crafting punchy, shareable WhatsApp Status updates that people screenshot and forward.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a WhatsApp Status update (text-based) that is SHORT and impactful.

CRITICAL RULES:
1. MAXIMUM 3-5 lines of text. Total UNDER 100 words. This is NOT a blog post.
2. Open with ONE punchy line or bold statement (can start with an emoji).
3. Pick THE single most interesting or surprising takeaway from the brief — ignore the rest.
4. Write like you're texting a friend. Short sentences. No bullet points. No numbered lists.
5. Max 2-3 emojis total. NOT a wall of emojis.
6. End with a forward-worthy line, a question, or a "DM me" type CTA.
7. ABSOLUTELY NO hashtags. Nobody uses hashtags on WhatsApp Status.
8. NO links unless specifically requested.
9. Think: what would make someone screenshot this and send it to a friend?

EXAMPLES OF GOOD WhatsApp Status:
- "AI से एक blog post 9 platforms के लिए ready हो गई। 60 seconds में। मैंने खुद try किया 🤯 DM करो अगर तुम्हें भी चाहिए"
- "6 महीने की building से एक lesson: perfect का wait मत करो, ship करो। बाकी सब feedback से आता है।"

IMPORTANT: If outputting Hindi/Hinglish, ALL Hindi words MUST be in Devanagari script. This applies to examples too. Never use Romanized Hindi (e.g. "maine" → "मैंने").

${languageFooter("whatsapp_status" as Platform, language)}

Write ONLY the status text. No JSON. No labels. No hashtags. Keep it SHORT.`;
}

export function buildTelegramPrompt(brief: ContentBrief, brandVoice: string | null, language: Language): string {
  return `You are an expert Telegram channel post writer. You understand how to deliver value in a conversational, newsletter-style format that keeps subscribers engaged and coming back.

${brandVoice ? `VOICE INSTRUCTION:\n${brandVoice}\n` : ""}

CONTENT BRIEF:
Core message: ${brief.coreMessage}
Key points: ${brief.keyPoints.join(" | ")}
Audience: ${brief.audience}
Tone: ${brief.tone}

YOUR TASK: Write a Telegram channel post that informs, engages, and feels personal.

RULES:
1. Conversational but informative — think newsletter-style, not social media hype
2. Use emojis naturally to break up text and guide the reader (not decoratively dumped)
3. Up to 4096 characters — use as much length as the content deserves, no padding
4. Short paragraphs with blank lines between them for readability
5. 2-4 relevant hashtags at the very end only — not scattered through the post
6. No self-promotional fluff — pure value for the reader
7. Works great for Indian audiences: Hindi, Hinglish, and regional languages are welcome
8. End with an engagement hook: a question, a "forward to someone who needs this", or a "reply with your take"
9. NEVER: "In today's post...", excessive caps, or spammy urgency language

${languageFooter("telegram" as Platform, language)}

Respond with ONLY the Telegram post text. No labels, no explanations, no JSON.`;
}
