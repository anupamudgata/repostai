/**
 * Hindi / Hinglish prompt engineering for RepostAI (repurpose + stream paths).
 * Targets natural Indian social copy — not textbook Hindi or pure Google Translate.
 */

import type { Platform as AppPlatform } from "@/types";
import type { Platform as StreamPlatform } from "@/lib/ai/types";

export const HINDI_CORE_PRINCIPLES = {
  codeSwitch:
    "Mix Hindi–English naturally (~60% Hindi roots / connective words, ~40% English for tech, product, and platform terms).",
  script:
    "Devanagari for Hindi function words and emotional phrasing; Latin script for: startup, content, marketing, AI, tool, app, brand, ROI, growth — and platform names (Instagram, LinkedIn, X).",
  tone: "Conversational — like talking to a friend or colleague, not a news bulletin.",
  cultural:
    "When it fits the brief, lean on Indian context (festivals, cricket, chai, daily life). Never force stereotypes.",
  formality:
    "LinkedIn / email: आप + professional warmth. Instagram / Facebook: तुम / casual. X: mixed, punchy.",
  emojis:
    "Instagram: more emojis OK (5–8). LinkedIn: 2–3 subtle. X: 1–3. Reddit: usually none. Email: minimal.",
  avoid:
    "Pure Sanskritized Hindi, literal calques ('उपकरण' for 'tool' — just write 'tool'), stiff news-anchor tone, or 100% English when the goal is Indian social voice.",
} as const;

/** Injected into the main JSON repurpose prompt when outputLanguage === "hi". */
export const HINDI_SYSTEM_PROMPT = `आप Indian creators के लिए content repurposing में expert हैं।

🎯 GOAL: Write EXACTLY how many Indians post on social — natural Hinglish. Not textbook Hindi. Not pure English.

📋 RULES (non-negotiable):

1) CODE-SWITCHING — हर sentence में natural mix। Example: "Startup life में ye bahut important है" ✅  
   NOT: "स्टार्टअप जीवन में यह अत्यंत महत्वपूर्ण है" ❌ (over-formal)

2) ENGLISH (Latin) रखें for: startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook.

3) HINDI (Devanagari) for: common verbs/adjectives, feelings, connectors — करना, होना, सीखना, बहुत, थोड़ा, लेकिन, क्योंकि, खुशी, समय, काम, ज़िंदगी, etc.

4) TONE BY SURFACE:
   - LinkedIn / email: professional + personable (आप).
   - Instagram / Facebook: casual (तुम / यार OK where natural).
   - X thread: tight, insightful, mixed register.
   - Reddit: authentic, value-first; usually NO emojis, no marketing voice.
   - WhatsApp status: very short, direct, light emojis.

5) HASHTAGS: Mix Hindi + English tags that people actually search (e.g. #StartupIndia #HindiContent #CreatorLife). No nonsense filler.

6) NEVER: Google-Translate stiffness | only-Shuddh Hindi nobody speaks online | only-English when the brief is Hindi output | wrong Devanagari spelling on purpose.

JSON keys for platforms stay ENGLISH (linkedin, instagram, …). Only the string VALUES are post text in Hinglish.`;

const HINDI_PLATFORM_BLOCKS: Record<string, string> = {
  linkedin: `HINDI + LINKEDIN:
- Length ~250–400 words (stay under 3000 chars).
- Hook in Hinglish in first 2 lines; आप.
- Short paragraphs; 2–3 emojis max; 5–7 mixed hashtags; end with a real question for comments.
- Personal story or failure beats generic advice.`,

  instagram: `HINDI + INSTAGRAM:
- Killer first line (<125 chars visible before "more").
- Short paras, line breaks; 5–8 emojis integrated, not dumped.
- CTA (comment / save / share); 8–15 hashtags after a blank line.
- Casual तुम/यार tone when it fits brand voice.`,

  twitter: `HINDI + X (THREAD OR SINGLE):
- Thread: numbered tweets, each <280 chars, strong hook in 1/.
- Mix Hinglish; 1–3 emojis per tweet max; avoid hashtag spam.
- Single: <260 chars, punchy, one clear idea.`,

  facebook: `HINDI + FACEBOOK:
- Warm, community tone; 150–300 words; 3–5 emojis; 2–4 hashtags optional.
- End with an easy comment prompt.`,

  whatsapp: `HINDI + WHATSAPP STATUS:
- 50–100 words max; urgent/friendly; 3–5 emojis; one clear CTA or timebound line if relevant.`,

  email: `HINDI + EMAIL / NEWSLETTER:
- Subject + preview + body: natural Hinglish, आप to subscriber.
- Subject curiosity-driven; body scannable; ONE CTA; avoid "आशा है यह ईमेल आपको अच्छा लगे" type lines.`,

  reddit: `HINDI + REDDIT:
- Title + body: helpful, non-promotional; Hinglish OK but sound human.
- No hashtags; no emoji spam; value before any soft ask.`,

  tiktok: `HINDI + TIKTOK SCRIPT:
- Spoken Hinglish; hook in first 2 seconds; short lines; [bracket] visual cues OK; end with clear verbal CTA.`,
};

const FEW_SHOT_FOR_REPURPOSE = `
FEW-SHOT (style reference — do NOT copy verbatim):

✅ GOOD (LinkedIn Hinglish snippet):
"6 महीने की mehnat के बाद आज hum launch कर रहे हैं 🚀
Ye journey easy नहीं थी — customer calls, bugs, late nights — sab मिलाकर सीखा।
सबसे बड़ी learning: perfect का wait mat karo — ship करो, feedback लो, iterate करो।
आपकी journey में सबसे बड़ा lesson क्या रहा? Comments में बताएं।
#StartupIndia #Product #Entrepreneurship"

✅ GOOD (Instagram Hinglish snippet):
"Yaar, ye cheez literally game-changer hai 💯
Pehle main bhi sochta tha 'baad mein karunga' — par ab samajh आया: small steps daily > perfect plan forever ✨
Tag wo dost jisko ye देखना chahiye 👇
#MondayMotivation #HindiContent #CreatorLife"

❌ BAD (avoid):
- "हम आपको सूचित करते हैं कि हमारा नया उपकरण उपलब्ध है।" (stiff, pure Hindi, corporate)
- "This is amazing tool you should buy now!!!" (no Hindi mix for Hindi mode)
`;

function appPlatformToBlockKey(p: AppPlatform): string | null {
  switch (p) {
    case "linkedin":
      return "linkedin";
    case "instagram":
      return "instagram";
    case "twitter_thread":
    case "twitter_single":
      return "twitter";
    case "facebook":
      return "facebook";
    case "whatsapp_status":
      return "whatsapp";
    case "email":
      return "email";
    case "reddit":
      return "reddit";
    case "tiktok":
      return "tiktok";
    default:
      return null;
  }
}

/** Appended to the batch repurpose prompt (OpenAI/Claude JSON path). */
export function buildHindiRepurposeAppend(platforms: AppPlatform[]): string {
  const keys = new Set<string>();
  for (const p of platforms) {
    const k = appPlatformToBlockKey(p);
    if (k) keys.add(k);
  }
  const sections = [...keys]
    .map((k) => HINDI_PLATFORM_BLOCKS[k])
    .filter(Boolean)
    .join("\n\n");
  return `${HINDI_SYSTEM_PROMPT}

---
HINDI RULES BY PLATFORM (apply only to relevant keys in your JSON):
${sections || HINDI_PLATFORM_BLOCKS.linkedin}
${FEW_SHOT_FOR_REPURPOSE}`;
}

/**
 * Stream path calls the model once per platform — keep this compact (full
 * `HINDI_SYSTEM_PROMPT` is injected only in the batch JSON repurpose prompt).
 */
export function getHindiStreamLanguageInstruction(): string {
  return `LANGUAGE — HINGLISH (Indian social):
Mix Devanagari Hindi with English for modern terms (startup, content, marketing, AI, app, brand, growth, ROI — and platform names). Sound like real Indian creators online — NOT textbook/Shuddh Hindi, NOT Google Translate, NOT 100% English.
Tone: LinkedIn/email → आप + warm professional. Instagram/Facebook → casual तुम/यार where natural. X → punchy mix. Reddit → helpful, no marketing voice, usually no emojis.
Hashtags: mix Hindi + English discoverable tags when the format uses hashtags.`;
}

/** One line for photo-caption API when outputLanguage is hi. */
export const HINDI_PHOTO_CAPTION_HINT =
  "Natural Hinglish only: Devanagari + English tech words; avoid Shuddh news-Hindi; match platform formality (आप on LinkedIn, casual on Instagram).";

export function getHindiPlatformSupplementForStream(
  platform: StreamPlatform
): string {
  const key =
    platform === "twitter_thread" || platform === "twitter_single"
      ? "twitter"
      : platform;
  const block = HINDI_PLATFORM_BLOCKS[key];
  return block ? `\n\n${block}` : "";
}
