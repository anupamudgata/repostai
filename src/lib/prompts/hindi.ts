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

1) CODE-SWITCHING — हर sentence में natural mix। Example: "Startup life में ये बहुत important है" ✅  
   NOT: "स्टार्टअप जीवन में यह अत्यंत महत्वपूर्ण है" ❌ (over-formal)
   NOT: "Startup life mein ye bahut important hai" ❌ (all Romanized — use Devanagari for Hindi words!)

2) ENGLISH (Latin script) ONLY for: startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, repurpose, video, blog.

3) HINDI words MUST be in DEVANAGARI script — NEVER Romanized:
   ✅ "मैंने सीखा", "बहुत ज़रूरी है", "लेकिन", "क्योंकि", "ये काम करता है", "आपने कभी सोचा"
   ❌ "maine seekha", "bahut zaroori hai", "lekin", "kyunki" (Romanized Hindi looks unprofessional)
   Common Hindi words that MUST be Devanagari: करना, होना, सीखना, बहुत, थोड़ा, लेकिन, क्योंकि, खुशी, समय, काम, ज़िंदगी, मैंने, आपने, हमने, सबसे, पहले, बाद, अभी, यार, दोस्त, etc.

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
- Killer first line (<125 chars visible before "more") — scroll-stopping desi hook.
- Tone: conversational, ENERGETIC, slightly dramatic (filmi energy) — not flat or informational.
- Short paras, line breaks; 5–8 emojis integrated, not dumped.
- Structure: [HOOK] → [Short story or value drop] → [CTA: save/share/comment].
- CTA MUST be in Hindi: "Save करो", "Share करो उस दोस्त को जिसको ज़रूरत है", "Comment में बताओ".
- 8–15 hashtags after a blank line.
- Use desi slang naturally: बवाल, मस्त, तगड़ा, दिमाग खराब, जुगाड़ — they boost relatability.
- Casual तुम/यार tone; sound like a popular Indian Reels creator, not a blog writer.`,

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
- Spoken Hinglish; hook in first 2 seconds — dramatic, attention-grabbing desi opener.
- Tone: ENERGETIC, slightly dramatic, filmi energy — sound like an Indian creator going viral, not reading a script.
- Short punchy lines; [bracket] visual cues OK; use desi slang (बवाल, तगड़ा, दिमाग खराब).
- Structure: [HOOK: scroll-stopper] → [Value/story in 15-30 sec] → [Verbal Hindi CTA: "Follow करो", "Save करो"].
- End with clear verbal CTA in Hindi.`,
};

/** Desi slang vocabulary — actively encouraged in casual platforms. */
export const HINDI_SLANG_VOCABULARY = `DESI SLANG TOOLKIT — Use these naturally (don't force all of them, pick what fits):

ENERGY/HYPE: बवाल ("ये तो बवाल है!"), मस्त, झक्कास, तगड़ा, कमाल, धांसू, सॉलिड, फ़ाड़ू, लिट
SURPRISE/SHOCK: दिमाग खराब ("ये देखके दिमाग खराब हो जाएगा"), होश उड़ गए, पागल हो गया, क्रेज़ी
CASUAL ADDRESS: भाई, यार, बॉस, दोस्त, भिड़ू (Mumbai), पापा log (ironic elder ref)
HUSTLE/SMART: जुगाड़, पैसा वसूल, चक्कर, तोड़, फ़ॉर्मूला, ट्रिक, हैक
AGREEMENT/EMPHASIS: बिल्कुल, सही बात, 100%, पक्का, लिख के ले लो, guarantee
DISMISSAL/SARCASM: छोड़ो, बकवास, टाइम बर्बाद, वाट लगा दी, फ़ालतू
RELATABLE: रिलेट करो, same pinch, मेरी कहानी, हम सबकी story, असली बात
DRAMA (filmi): "picture अभी बाकी है", "ये तो trailer था", "interval", "climax", "full entry"

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally — these platforms reward desi energy
- LinkedIn: use sparingly and professionally ("तगड़ा result", "सॉलिड framework" — OK; "बवाल मचा दिया" — too casual)
- Reddit: minimal slang, sound helpful not hype
- WhatsApp: natural texting slang OK
- ALWAYS in Devanagari script — never "jugaad", always "जुगाड़"`;

/** Cultural context layer — Indian-native references for authentic Hinglish. */
export const HINDI_CULTURAL_CONTEXT = `CULTURAL AUTHENTICITY — Think like a popular Indian creator, not a translation engine:

1) CULTURAL REFERENCES (use when contextually appropriate):
   - Cricket: "century मारना", "six मारना", "सामने से bounce आएगा", "IPL level performance"
   - Bollywood: dialogue-style punch lines, "picture अभी बाकी है", filmi references for emphasis
   - Daily life: chai breaks, jugaad solutions, "मम्मी ने बोला था", traffic/metro humor, exam season stress
   - Food: "chai pe charcha", "samosa economics", "paratha > protein shake"
   - Festivals/seasons: Diwali planning, Holi vibes, monsoon mood, wedding season chaos, board exam era

2) DESI INTERNET CULTURE:
   - Meme-aware tone: "arre bhai", "sahi pakde hain", "पैसा ही पैसा होगा" (know when to reference without overusing)
   - Reels/short-form energy: quick setups, relatable punchlines
   - Brand-literate: Zomato-style wit, CRED-style absurdity, Amul-style topical takes — emulate that energy

3) AUDIENCE REGISTERS (adapt Hinglish density):
   - Startup/tech bro: heavy English mix, VC jargon + Hindi connectives ("basically ये हो गया pivot")
   - Students/young audience: trendy slang, meme formats, casual AF
   - Professionals/corporate: measured Hinglish, आप-based, insight-driven
   - Small business/regional brands: more Hindi, simple English terms, warm family-like tone
   - Homemakers/lifestyle: relatable daily life, "ये hack try करो", practical tone

4) AUTHENTICITY MARKERS (these make content feel Indian-born, not translated):
   - Natural filler particles: "अरे", "बस", "ना", "हाँ", "सच में" (use sparingly)
   - Indian emphasis patterns: "literally", "actually", "basically" as Hinglish markers
   - Desi comparisons over Western ones: "Sachin की consistency" > "consistency of a Swiss watch"`;

export const HINDI_OPENING_VARIETY = `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. NEVER reuse these tired openers:
❌ "6 महीने पहले..." / "आज मैं share कर रहा हूँ..." / "क्या आपने कभी सोचा..." / "ये post बहुत important है"

Instead, rotate through DIFFERENT hook styles:
- Bold contrarian: "सबको लगता है X, पर सच ये है कि Y"
- Stat/number lead: "97% creators ये गलती करते हैं"
- Story cold open: "कल रात 2 बजे मुझे एक DM आया..."
- Cultural reference: "जैसे IPL में last over में सब बदल जाता है..."
- Question that stings: "अगर तुम्हारा content 100 लोगों तक नहीं पहुँच रहा, तो किसके लिए बना रहे हो?"
- Observation: "एक pattern notice किया है — जो creators daily post करते हैं..."
- Controversy/hot take: "Unpopular opinion: LinkedIn पर vulnerability posts overrated हैं"
- Direct command: "ये save कर लो, बाद में काम आएगा"`;

const FEW_SHOT_FOR_REPURPOSE = `
FEW-SHOT (style reference — match the Devanagari + English mix, but NEVER copy verbatim. Each output must feel fresh and unique):

✅ GOOD — LinkedIn (Startup/Tech):
"Product बनाने में सबसे बड़ा trap: "एक और feature add कर लेते हैं" 🚀

3 साल SaaS build करने के बाद ये समझ आया — customers features नहीं चाहते, वो problem solved चाहते हैं।

हमने 47 features बनाए। सिर्फ 3 का लोग use करते थे।

बाकी 44? Vanity metrics थे — team को अच्छा लगता था, customer को फ़र्क नहीं पड़ता था।

अब rule सिंपल है: अगर user ने 3 बार नहीं माँगा, build नहीं करेंगे।

आपकी team में ऐसा कौनसा feature है जो बनाया पर कोई use नहीं करता?

#SaaS #ProductManagement #StartupIndia #BuildInPublic"

✅ GOOD — LinkedIn (Finance/Career):
"Salary negotiation में सबसे powerful word: silence 🤫

मैंने HR से बोला 'मुझे लगता है ये offer मेरी expectations से कम है।'

फिर चुप हो गया। 15 seconds तक।

उन्होंने 2.5 lakh बढ़ा दिया।

90% लोग gap fill करने के लिए बोलते रहते हैं — पर negotiation में जो चुप रहता है, वो जीतता है।

ये technique सिर्फ salary में नहीं, client deals में भी काम करती है।

#CareerGrowth #NegotiationTips #ProfessionalDevelopment"

✅ GOOD — Instagram (Fitness/Lifestyle):
"Gym जाना easy है 💪
Gym जाते रहना — वो असली game है

बारिश हो, ठंड हो, meeting हो, mood ना हो — पर जो discipline maintain करता है वो results देखता है 🔥

मेरा rule simple है:
→ बुरा दिन? 20 minutes ही सही
→ Energy नहीं? Walk ही कर लो
→ Time नहीं? Home workout

बस consistency चाहिए, perfection नहीं ✨

Save करो और daily याद दिलाओ खुद को 📌

#FitnessMotivation #GymLife #HealthyHabits #ConsistencyIsKey"

✅ GOOD — Instagram (Food/Culture):
"Sunday morning + आलू पराठा + अचार + ठंडी लस्सी = therapy 🥰

कोई भी fancy brunch इसका मुकाबला नहीं कर सकता। Period.

मम्मी का हाथ का खाना > किसी भी Michelin star restaurant 💯

बताओ तुम्हारा comfort food क्या है? 👇

#DesiFood #SundayVibes #FoodieLife #IndianFood #ComfortFood"

✅ GOOD — X/Twitter (Single, punchy):
"AI tools use करना advantage नहीं है। सही AI tool सही काम के लिए use करना advantage है। बाकी सब noise है।"

✅ GOOD — X/Twitter (Thread hook):
"1/ पिछले 2 साल में 200+ creators को observe किया।

जो grow हुए उनमें एक common pattern मिला — और वो 'consistency' नहीं है 🧵"

✅ GOOD — Facebook (Community):
"एक बात honestly बोलूँ? 🤔

पहले मुझे लगता था 'networking' means events में जाकर cards exchange करना।

पर असली networking तब हुई जब मैंने बिना कुछ expect किए 3 लोगों की genuine help की।

6 महीने बाद उनमें से 2 ने मुझे referrals दिए जो paid clients बने।

Lesson: value दो बिना scorecard maintain किए। Returns automatically आते हैं 🙌

तुम्हारे साथ ऐसा कब हुआ? Share करो 👇"

✅ GOOD — Reddit (Value-first):
Title: "2 साल freelancing करने के बाद ये 5 चीज़ें सीखीं — शायद किसी के काम आएँ"
Body: "context + honest failure story + structured learnings + no self-promotion"

✅ GOOD — WhatsApp Status:
"Content बनाने से ज़्यादा important है content distribute करना। एक अच्छा post 5 platforms पर डालो। Results खुद दिखेंगे 💡"

✅ GOOD — WhatsApp Status (Casual):
"कल client ने बोला 'ये AI ने लिखा है?' मैंने बोला 'नहीं, मैंने लिखा AI की help से।' Difference समझो 😄"

✅ GOOD — TikTok Script:
"[HOOK] सबसे बड़ी गलती जो new creators करते हैं
[TEXT ON SCREEN: ये मत करो ❌]
बस content बनाते जाओ और hope करो कि viral हो जाएगा — ये strategy नहीं है, ये lottery है
[TEXT ON SCREEN: इसकी बजाय ✅]
पहले 50 posts सीखने के लिए बनाओ, audience समझो, फिर double down करो
Follow करो — ऐसे और tips आते रहेंगे"

✅ GOOD — Email Newsletter:
Subject: "ये 3-minute trick मेरा पूरा workflow बदल दिया"
Body: "Hi [Name], कल एक experiment किया... → story + insight + one CTA"

❌ BAD (avoid these patterns):
- "हम आपको सूचित करते हैं कि हमारा नया उपकरण उपलब्ध है।" → stiff Shuddh Hindi, corporate news-anchor tone
- "Maine seekha ki ye bahut zaroori hai" → Romanized Hindi — ALWAYS use Devanagari: "मैंने सीखा कि ये बहुत ज़रूरी है"
- "This is amazing tool you should buy now!!!" → no Hindi mix at all when goal is Hinglish
- "आइये जानते हैं 5 तरीके..." → news channel opening, not social media
- "दोस्तों, आज हम बात करेंगे..." → YouTube 2015 style, not modern social
- Starting every post with "6 महीने पहले..." → formulaic, boring
- "क्या आपने कभी सोचा है कि..." → overused question opener
- Ending every LinkedIn with "आपका क्या अनुभव रहा?" → lazy engagement bait
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

${HINDI_SLANG_VOCABULARY}

${HINDI_CULTURAL_CONTEXT}

${HINDI_OPENING_VARIETY}

---
HINDI RULES BY PLATFORM (apply only to relevant keys in your JSON):
${sections || HINDI_PLATFORM_BLOCKS.linkedin}
${FEW_SHOT_FOR_REPURPOSE}`;
}

/** Full Hindi system prompt for stream path — gives stream the same quality as batch. */
export function getHindiStreamSystemPrompt(): string {
  return HINDI_SYSTEM_PROMPT;
}

/** Stream-specific Hindi instructions appended to user message. */
export function getHindiStreamLanguageInstruction(tonePreset?: string): string {
  let toneInstruction: string;
  switch (tonePreset) {
    case "professional":
      toneInstruction = "Tone: Professional — use formal pronouns (आप), measured language, authority-based openers, no slang except sparingly.";
      break;
    case "gen_z":
      toneInstruction = "Tone: Gen-Z — ultra-casual, meme-aware, irony, short punchy sentences, internet-first language, energy over formality. Use the youngest-sounding slang from the toolkit.";
      break;
    case "casual":
    default:
      toneInstruction = "Tone: Casual — use informal pronouns (तुम/यार), slang from the toolkit, lighter humor, conversational openers. Posts should feel like texting a friend.";
  }
  return `LANGUAGE — HINGLISH (Indian social):
CRITICAL: Hindi words MUST be in Devanagari script (मैंने, सीखा, बहुत, लेकिन, ज़रूरी). NEVER write Hindi in Roman script (maine, seekha, bahut, lekin). English tech/platform terms stay in Latin script (startup, content, AI, brand, growth, LinkedIn).
Mix Devanagari Hindi (~60%) with English (~40%). Sound like real Indian creators posting on social — NOT textbook Hindi, NOT Google Translate, NOT 100% English.
Tone: LinkedIn/email → आप + warm professional. Instagram/Facebook → casual तुम/यार where natural. X → punchy mix. Reddit → helpful, no marketing voice, usually no emojis. WhatsApp → SHORT (3-5 lines max), no hashtags.
Hashtags: mix Hindi + English discoverable tags when the format uses hashtags (NOT on WhatsApp).

${HINDI_SLANG_VOCABULARY}

${HINDI_CULTURAL_CONTEXT}

${HINDI_OPENING_VARIETY}

${toneInstruction}`;
}

/** Comprehensive Hindi instructions for photo-caption API. */
export const HINDI_PHOTO_CAPTION_HINT = `Natural Hinglish only — write like Indian creators post, not like a translation engine.

SCRIPT RULES:
- Hindi words MUST be in Devanagari: मैंने, बहुत, ज़रूरी, लेकिन, ज़िंदगी
- NEVER Romanize Hindi: "maine", "bahut", "zaroori" = WRONG
- English tech/platform terms stay Latin: AI, app, brand, content, startup

TONE BY PLATFORM:
- Instagram: casual, emojis OK, relatable desi tone, hashtags at end
- Facebook: warm community feel, easy comment prompt
- Twitter/X: punchy, tight, under 280 chars
- LinkedIn: professional Hinglish, आप-based, insight-driven

CULTURAL FIT:
- Use Indian references when natural: chai, cricket, Bollywood, jugaad, desi daily life
- Sound like a popular Indian creator posting about this photo
- Avoid stiff Shuddh Hindi or news-anchor tone

PHOTO CAPTION EXAMPLES (Hinglish):
- Food photo: "इससे बेहतर Sunday plan क्या हो सकता है? 😍 Comment करो तुम्हारा go-to weekend food"
- Travel photo: "ये view देखो और बताओ — work from office vs work from here? 🏔️ Answer obvious है"
- Product photo: "Finally आ गया! 2 महीने का wait ख़त्म 🎉 Review जल्दी आएगा"
- Selfie/casual: "आज का mood: सब sorted है 😌 बस chai मिल जाए तो दिन बन जाए"`;

/** Condensed Hindi system context for photo caption Claude calls. */
export function getHindiPhotoCaptionSystemPrompt(): string {
  return `${HINDI_SYSTEM_PROMPT}

${HINDI_CULTURAL_CONTEXT}

PHOTO CAPTIONS — write captions that feel like an Indian creator naturally posting about this image. Match platform conventions. Keep it authentic, not translated.`;
}

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
