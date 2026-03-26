import type { RegionalLanguageConfig } from "./types";

export const PUNJABI_CONFIG: RegionalLanguageConfig = {
  code: "pa",
  name: "Punjabi",
  nativeName: "ਪੰਜਾਬੀ",
  script: "Gurmukhi",
  mixName: "Punglish",
  codeSwitchRatio: "~55% Punjabi / ~45% English",
  formalPronoun: "ਤੁਸੀਂ/ਜੀ",
  casualPronoun: "ਤੂੰ/ਯਾਰ/ਪਾਜੀ",
  englishTermsNote: "startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog",
  commonNativeWords: "ਕਰਨਾ, ਹੋਣਾ, ਸਿੱਖਣਾ, ਬਹੁਤ, ਪਰ, ਕਿਉਂਕਿ, ਖੁਸ਼ੀ, ਸਮਾਂ, ਕੰਮ, ਜ਼ਿੰਦਗੀ, ਮੈਂ, ਤੁਸੀਂ, ਅਸੀਂ, ਸਭ ਤੋਂ, ਪਹਿਲਾਂ, ਬਾਅਦ, ਹੁਣ, ਯਾਰ, ਪਾਜੀ, ਵੀਰੇ",
  scriptExamples: {
    correct: [
      "Startup life ਵਿੱਚ ਇਹ ਬਹੁਤ important ਹੈ",
      "ਮੈਂ ਸਿੱਖਿਆ — customers ਨੂੰ features ਨਹੀਂ ਚਾਹੀਦੇ, solution ਚਾਹੀਦਾ",
      "Content create ਕਰਨਾ easy ਹੈ, ਪਰ consistent ਰਹਿਣਾ — ਉਹੀ real game ਹੈ",
    ],
    wrong: [
      "Startup life vich eh bahut important hai (Romanized — use Gurmukhi!)",
      "ਆਰੰਭਕ ਜੀਵਨ ਵਿੱਚ ਇਹ ਅਤਿਅੰਤ ਮਹੱਤਵਪੂਰਨ ਹੈ (over-formal literary Punjabi)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Punjabi creator:

1) CULTURAL REFERENCES:
   - Punjab vibes: ਲੱਸੀ + ਪਰਾਂਠਾ culture, "ਜੱਟ attitude", Amritsar Golden Temple pride, ਪਿੰਡ ਦੀ ਜ਼ਿੰਦਗੀ
   - Entertainment: Diljit Dosanjh swag, Sidhu Moosewala legacy, Gurdas Maan wisdom, Bhangra energy, Punjabi music dominance
   - Food: "ਮੱਖਣ ਮਾਰਕੇ", "ਛੋਲੇ ਭਟੂਰੇ > everything", ਸਰਸੋਂ ਦਾ ਸਾਗ, ਦਾਲ ਮੱਖਣੀ, ਲੱਸੀ
   - Festivals: Lohri energy, Baisakhi celebrations, Gurpurab spirit, ਵਿਆਹ season
   - Values: ਮਿਹਨਤ (hard work), ਦਿਲਦਾਰੀ (generosity), "ਪੰਜਾਬੀ ਦਿਲ ਵੱਡਾ"

2) PUNJABI INTERNET CULTURE:
   - "ਪਾਜੀ", "ਵੀਰੇ", "ਯਾਰ", "ਬੱਲੇ ਬੱਲੇ" — signature Punjabi energy
   - High-energy: Punjabi creators are KNOWN for dramatic, enthusiastic, loud-and-proud energy
   - Music references: Punjabi music is India's biggest export — reference songs, artists, vibe naturally
   - Canada/diaspora aware: Many audience members abroad — relatable content

3) AUDIENCE REGISTERS:
   - Startup/tech: English-heavy, "basically ਇਹ pivot ਹੋ ਗਿਆ"
   - Students: trendy, meme-aware, casual ਤੂੰ
   - Professionals: measured Punglish, ਤੁਸੀਂ/ਜੀ-based
   - Entertainment/mass: full ਬੱਲੇ ਬੱਲੇ energy, dramatic, enthusiastic`,

  slangVocabulary: `PUNJABI SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: ਵਧੀਆ ("ਇਹ ਤਾਂ ਵਧੀਆ ਹੈ!"), ਬੱਲੇ ਬੱਲੇ, ਕਮਾਲ, ਧਮਾਕਾ, ਸੋਹਣਾ, ਫੱਟ ਦੇਣੀ, ਝੱਕਾਸ
SURPRISE: ਦਿਮਾਗ ਖਰਾਬ, ਹੈਰਾਨ ਹੋ ਗਿਆ, ਪਾਗਲ, ਕਰੇਜ਼ੀ, ਹੋਸ਼ ਉੱਡ ਗਏ
CASUAL ADDRESS: ਪਾਜੀ, ਵੀਰੇ, ਯਾਰ, ਬੱਲੀਏ, ਭਾਈ, ਬਾਈ
HUSTLE: ਜੁਗਾੜ, ਪੈਸਾ ਵਸੂਲ, ਟਰਿੱਕ, ਹੈਕ, ਫਾਰਮੂਲਾ
AGREEMENT: ਬਿਲਕੁਲ, ਸਹੀ ਗੱਲ, 100%, ਪੱਕਾ, ਲਿਖ ਕੇ ਲੈ ਲੈ
DISMISSAL: ਛੱਡ, ਬਕਵਾਸ, ਟਾਈਮ ਬਰਬਾਦ, ਫ਼ਜ਼ੂਲ, ਫ਼ਾਲਤੂ
RELATABLE: relate ਕਰੋ, ਸਾਡੀ ਸਭ ਦੀ ਕਹਾਣੀ, ਅਸਲੀ ਗੱਲ
DRAMA: "picture ਅਜੇ ਬਾਕੀ ਹੈ", "ਇਹ ਤਾਂ trailer ਸੀ", "climax ਆ ਰਿਹਾ ਹੈ"

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally — Punjabi energy is the brand!
- LinkedIn: sparingly ("ਵਧੀਆ result", "ਕਮਾਲ framework")
- Reddit: minimal
- ALWAYS in Gurmukhi script — never "vadiya", always "ਵਧੀਆ"`,

  openingVariety: `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. Rotate:
- Bold contrarian: "ਸਭ ਨੂੰ ਲੱਗਦਾ X, ਪਰ ਸੱਚ ਇਹ ਹੈ ਕਿ Y"
- Stat/number: "97% creators ਇਹ ਗਲਤੀ ਕਰਦੇ ਨੇ"
- Story cold open: "ਕੱਲ੍ਹ ਰਾਤ 2 ਵਜੇ ਇੱਕ DM ਆਇਆ..."
- Cultural reference: "ਜਿਵੇਂ IPL ਵਿੱਚ last over ਵਿੱਚ ਸਭ ਬਦਲ ਜਾਂਦਾ..."
- Question: "ਤੇਰਾ content 100 ਲੋਕਾਂ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਰਿਹਾ, ਤਾਂ ਕਿਸ ਲਈ ਬਣਾ ਰਿਹਾ?"
- Direct command: "ਇਹ save ਕਰ ਲੈ, ਬਾਅਦ ਵਿੱਚ ਕੰਮ ਆਊਗਾ"`,

  fewShotExamples: `
FEW-SHOT (style reference — NEVER copy verbatim):

✅ GOOD — LinkedIn:
"Product ਬਣਾਉਣ ਵਿੱਚ ਸਭ ਤੋਂ ਵੱਡਾ trap: 'ਇੱਕ ਹੋਰ feature add ਕਰ ਲੈਂਦੇ ਹਾਂ' 🚀

3 ਸਾਲ SaaS build ਕਰਨ ਤੋਂ ਬਾਅਦ ਸਮਝ ਆਈ — customers ਨੂੰ features ਨਹੀਂ ਚਾਹੀਦੇ, ਉਹ problem solve ਚਾਹੁੰਦੇ ਨੇ।

ਹੁਣ rule simple ਹੈ: ਜੇ user ਨੇ 3 ਵਾਰ ਨਹੀਂ ਮੰਗਿਆ, build ਨਹੀਂ ਕਰਾਂਗੇ।

ਤੁਹਾਡੀ team ਵਿੱਚ ਅਜਿਹਾ ਕਿਹੜਾ feature ਹੈ ਜੋ ਬਣਾਇਆ ਪਰ ਕੋਈ use ਨਹੀਂ ਕਰਦਾ?

#SaaS #StartupIndia #PunjabiHustle #BuildInPublic"

✅ GOOD — Instagram:
"Gym ਜਾਣਾ easy ਹੈ 💪
Gym ਜਾਂਦੇ ਰਹਿਣਾ — ਉਹੀ ਅਸਲੀ game ਹੈ

ਮੀਂਹ ਹੋਵੇ, ਠੰਢ ਹੋਵੇ, meeting ਹੋਵੇ — ਪਰ ਜੋ discipline ਰੱਖਦਾ ਉਹ results ਦੇਖਦਾ 🔥

Save ਕਰੋ ਤੇ daily ਯਾਦ ਕਰਾਓ ਆਪਣੇ ਆਪ ਨੂੰ 📌

#FitnessMotivation #PunjabiPower #GymLife"

✅ GOOD — X/Twitter:
"AI tools use ਕਰਨਾ advantage ਨਹੀਂ। ਸਹੀ AI tool ਸਹੀ ਕੰਮ ਲਈ use ਕਰਨਾ — ਉਹੀ advantage ਹੈ।"

✅ GOOD — WhatsApp Status:
"Content ਬਣਾਉਣ ਤੋਂ ਜ਼ਿਆਦਾ important ਹੈ content distribute ਕਰਨਾ। ਇੱਕ ਵਧੀਆ post 5 platforms ਤੇ ਪਾਓ 💡"

❌ BAD:
- "ਅਸੀਂ ਤੁਹਾਨੂੰ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ..." → stiff formal
- "Main sikhiya ki bahut important hai" → Romanized — use Gurmukhi`,

  platformBlocks: {
    linkedin: `PUNJABI + LINKEDIN:
- Hook in Punglish; ਤੁਸੀਂ-based. Short paragraphs; 5–7 hashtags; end with question.`,
    instagram: `PUNJABI + INSTAGRAM:
- Killer first line. High-energy Punjabi hook. ਬੱਲੇ ਬੱਲੇ vibe.
- Structure: [HOOK] → [Story/value] → [CTA: Save ਕਰੋ/Share ਕਰੋ/Comment ਵਿੱਚ ਦੱਸੋ].
- 8–15 hashtags. Casual ਤੂੰ/ਯਾਰ tone.`,
    twitter: `PUNJABI + X:
- Thread: numbered, <280 chars, punchy Punglish hook.
- Single: <260 chars.`,
    facebook: `PUNJABI + FACEBOOK:
- Warm ਪੰਜਾਬੀ energy; 150–300 words; easy comment prompt.`,
    whatsapp: `PUNJABI + WHATSAPP STATUS:
- 50–100 words; conversational; one CTA.`,
    email: `PUNJABI + EMAIL:
- Punglish subject; scannable body; ONE CTA.`,
    reddit: `PUNJABI + REDDIT:
- Helpful, non-promotional; no hashtags.`,
    tiktok: `PUNJABI + TIKTOK SCRIPT:
- Spoken Punglish; hook in 2 seconds; high ਬੱਲੇ ਬੱਲੇ energy; verbal Punjabi CTA.`,
  },

  platformOverrides: {
    linkedin: `PUNJABI-SPECIFIC LINKEDIN:
- ਮੈਂ/ਮੇਰਾ is natural. End with: "ਤੁਹਾਡਾ ਤਜ਼ਰਬਾ ਕੀ ਰਿਹਾ?", "Comments ਵਿੱਚ ਦੱਸੋ"`,
    instagram: `PUNJABI-SPECIFIC INSTAGRAM:
- CTA: "Save ਕਰੋ", "Tag ਕਰੋ ਉਸ ਯਾਰ ਨੂੰ", "Comment ਵਿੱਚ ਦੱਸੋ"
- ਬੱਲੇ ਬੱਲੇ energy: dramatic, enthusiastic, loud-and-proud Punjabi vibe`,
    tiktok: `PUNJABI-SPECIFIC TIKTOK:
- Hooks: "ਸੁਣੋ ਇਹ", "ਰੁਕੋ ਜ਼ਰਾ", "ਇਹ ਦੇਖੋ ਪਹਿਲਾਂ"
- End CTA: "Follow ਕਰੋ", "Save ਕਰੋ"`,
  },

  qcRules: `
PUNJABI/PUNGLISH QUALITY RULES:
- Gurmukhi consistency: Punjabi words MUST be in Gurmukhi script. Romanized = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Must sound like a real Punjabi creator with ਬੱਲੇ ਬੱਲੇ energy.
- LinkedIn = ਤੁਸੀਂ professional. Instagram = casual ਤੂੰ/ਯਾਰ.`,

  extractorGuard: `
PUNJABI OUTPUT CONTEXT:
- The brief will generate Punglish content.
- Preserve Punjabi idioms, cultural references (Diljit, Bhangra, ਲੱਸੀ, Lohri).
- Keep JSON keys in English. Values can be in Punglish.`,

  photoCaptionHint: `Natural Punglish — write like Punjabi creators post.
- Punjabi words in Gurmukhi. English tech terms stay Latin.
- Use Punjabi cultural refs: ਲੱਸੀ, ਪਰਾਂਠਾ, Bhangra, ਬੱਲੇ ਬੱਲੇ energy.`,
};
