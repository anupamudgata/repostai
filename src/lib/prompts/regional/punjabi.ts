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
  commonNativeWords: "ਕਰਨਾ, ਹੋਣਾ, ਸਿੱਖਣਾ, ਬਹੁਤ, ਪਰ, ਕਿਉਂਕਿ, ਖੁਸ਼ੀ, ਸਮਾਂ, ਕੰਮ, ਜ਼ਿੰਦਗੀ, ਮੈਂ, ਤੁਸੀਂ, ਅਸੀਂ, ਸਭ ਤੋਂ, ਪਹਿਲਾਂ, ਬਾਅਦ, ਹੁਣ, ਯਾਰ, ਪਾਜੀ, ਵੀਰੇ, ਚਾਹੀਦਾ, ਪਤਾ, ਮਿਲਿਆ, ਦੇਖ, ਦੱਸ, ਆ, ਜਾ, ਨਹੀਂ, ਹਾਂ, ਕੀ, ਕਿਵੇਂ, ਥੋੜਾ, ਚੰਗਾ, ਸੱਚ, ਉਹ, ਇਹ, ਸਾਡਾ",
  scriptExamples: {
    correct: [
      "Startup life ਵਿੱਚ ਇਹ ਬਹੁਤ important ਹੈ",
      "ਮੈਂ ਸਿੱਖਿਆ — customers ਨੂੰ features ਨਹੀਂ ਚਾਹੀਦੇ, solution ਚਾਹੀਦਾ",
      "Content create ਕਰਨਾ easy ਹੈ, ਪਰ consistent ਰਹਿਣਾ — ਉਹੀ real game ਹੈ",
      "ਪਾਜੀ Diljit ਵਰਗਾ vibe ਚਾਹੀਦਾ? ਤਾਂ ਆਪਣਾ genuine self show ਕਰ — ਕੋਈ fake ਨਾ, ਕੋਈ act ਨਾ, ਬੱਸ ਤੂੰ 💯",
      "Brampton ਤੋਂ Chandigarh ਤੱਕ — ਪੰਜਾਬੀ creator scene ਹੁਣ ਦੁਨੀਆ ਦੇਖ ਰਹੀ ਹੈ। ਤੇਰੀ ਆਵਾਜ਼ ਮੇਟਰ ਕਰਦੀ ਹੈ 🎶",
    ],
    wrong: [
      "Startup life vich eh bahut important hai (Romanized — use Gurmukhi!)",
      "ਆਰੰਭਕ ਜੀਵਨ ਵਿੱਚ ਇਹ ਅਤਿਅੰਤ ਮਹੱਤਵਪੂਰਨ ਹੈ (over-formal literary Punjabi)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Punjabi creator:

1) CULTURAL REFERENCES:
   - Punjab vibes: ਲੱਸੀ + ਪਰਾਂਠਾ culture, "ਜੱਟ attitude", Amritsar Golden Temple pride, ਪਿੰਡ ਦੀ ਜ਼ਿੰਦਗੀ
   - Entertainment: Diljit Dosanjh swag ("Diljit ਵਾਂਗੂ worldwide go"), Sidhu Moosewala legacy, Gurdas Maan wisdom, Bhangra energy, Punjabi music global dominance
   - Diljit references: "Diljit ਨੇ Coachella ਕੀਤਾ — ਤੂੰ ਕੀ ਕਰੇਂਗਾ?", "Patiala peg energy", "Turban swag worldwide"
   - Food: "ਮੱਖਣ ਮਾਰਕੇ", "ਛੋਲੇ ਭਟੂਰੇ > everything", ਸਰਸੋਂ ਦਾ ਸਾਗ, ਦਾਲ ਮੱਖਣੀ, ਲੱਸੀ
   - Festivals: Lohri energy, Baisakhi celebrations, Gurpurab spirit, ਵਿਆਹ season
   - Values: ਮਿਹਨਤ (hard work), ਦਿਲਦਾਰੀ (generosity), "ਪੰਜਾਬੀ ਦਿਲ ਵੱਡਾ"
   - ਅੰਨਦਾਤਾ (farmers) heritage: "ਸਾਡੇ ਕਿਸਾਨ ਭੈਣ ਭਰਾ — ਅੰਨਦਾਤਾ ਦੀ ਮਿਹਨਤ ਨੂੰ ਸਲਾਮ", agricultural pride in Punjabi identity
   - Canada/NRI diaspora: "Brampton ਵਾਲੇ ਪਾਜੀ", "Surrey ਦੇ ਵੀਰੇ", UK/Canada Punjabi community — "ਘਰ ਦੀ ਯਾਦ ਆਉਂਦੀ ਹੈ" hooks
   - Chandigarh/Mohali startup culture: "Chandigarh ਦਾ startup ecosystem growing ਹੈ", IT City Mohali, Tricity hustle
   - Bhangra global reach: "Bhangra ਹੁਣ world stage ਤੇ" — metaphor for Punjabi talent going global

2) PUNJABI INTERNET CULTURE:
   - "ਪਾਜੀ", "ਵੀਰੇ", "ਯਾਰ", "ਬੱਲੇ ਬੱਲੇ" — signature Punjabi energy
   - High-energy: Punjabi creators are KNOWN for dramatic, enthusiastic, loud-and-proud energy
   - Music references: Punjabi music is India's biggest export — reference songs, artists, vibe naturally
   - Canada/diaspora aware: Many audience members in Canada/UK — relatable content for NRI Punjabis
   - "Punjabi by heart" energy: pride in being Punjabi regardless of location, "ਦਿਲੋਂ ਪੰਜਾਬੀ" identity

3) AUDIENCE REGISTERS:
   - Startup/tech: English-heavy, "basically ਇਹ pivot ਹੋ ਗਿਆ", Chandigarh/Mohali tech workers
   - Students: trendy, meme-aware, casual ਤੂੰ, Diljit-coded energy
   - Professionals: measured Punglish, ਤੁਸੀਂ/ਜੀ-based
   - Entertainment/mass: full ਬੱਲੇ ਬੱਲੇ energy, dramatic, enthusiastic
   - NRI diaspora: Canada/UK Punjabis — nostalgia hooks, homeland pride, "ਦੇਸ਼ ਦੀ ਯਾਦ" emotional triggers`,

  slangVocabulary: `PUNJABI SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: ਵਧੀਆ ("ਇਹ ਤਾਂ ਵਧੀਆ ਹੈ!"), ਬੱਲੇ ਬੱਲੇ, ਕਮਾਲ, ਧਮਾਕਾ, ਸੋਹਣਾ, ਫੱਟ ਦੇਣੀ, ਝੱਕਾਸ, ਮਸਤ, ਇੱਕ ਦਮ ਟੌਪ
SURPRISE: ਦਿਮਾਗ ਖਰਾਬ, ਹੈਰਾਨ ਹੋ ਗਿਆ, ਪਾਗਲ, ਕਰੇਜ਼ੀ, ਹੋਸ਼ ਉੱਡ ਗਏ, ਭਾਈ ਇਹ ਤਾਂ ਪਤਾ ਨਹੀਂ ਸੀ, ਅੱਖਾਂ ਖੁੱਲ੍ਹ ਗਈਆਂ
CASUAL ADDRESS: ਪਾਜੀ, ਵੀਰੇ, ਯਾਰ, ਬੱਲੀਏ, ਭਾਈ, ਬਾਈ, ਭੈਣੇ (female audience), ਚਾਚਾ ਜੀ (elder)
HUSTLE: ਜੁਗਾੜ, ਪੈਸਾ ਵਸੂਲ, ਟਰਿੱਕ, ਹੈਕ, ਫਾਰਮੂਲਾ, ਗ੍ਰਾਈਂਡ ਚੱਲ ਰਿਹਾ, ਛੋਟੀਆਂ ਜਿੱਤਾਂ ਵੱਡੀਆਂ ਬਣਦੀਆਂ
AGREEMENT: ਬਿਲਕੁਲ, ਸਹੀ ਗੱਲ, 100%, ਪੱਕਾ, ਲਿਖ ਕੇ ਲੈ ਲੈ, ਹਾਂ ਯਾਰ ਇਹੀ ਸੱਚ, ਇੱਕ ਦਮ ਸਹੀ
DISMISSAL: ਛੱਡ, ਬਕਵਾਸ, ਟਾਈਮ ਬਰਬਾਦ, ਫ਼ਜ਼ੂਲ, ਫ਼ਾਲਤੂ, ਛੱਡ ਯਾਰ ਚਿੰਤਾ ਨਾ ਕਰ, ਇਹ ਦਰਕਾਰ ਨਹੀਂ
RELATABLE: relate ਕਰੋ, ਸਾਡੀ ਸਭ ਦੀ ਕਹਾਣੀ, ਅਸਲੀ ਗੱਲ, ਦਿਲ ਦੀ ਗੱਲ, ਇਹ ਤੇਰੀ ਗੱਲ ਨਹੀਂ?
DRAMA: "picture ਅਜੇ ਬਾਕੀ ਹੈ", "ਇਹ ਤਾਂ trailer ਸੀ", "climax ਆ ਰਿਹਾ ਹੈ"
GEN-Z INTERNET: ਇਹ fire ਹੈ, no cap ਪਾਜੀ, main character energy, ਇਹ differently ਲੱਗਾ, ✨vibes✨ ਵੱਖਰੇ, ਰੁਕ ਜ਼ਰਾ
EMOTIONAL RELATABILITY: "ਇਹ ਤੇਰੀ ਕਹਾਣੀ ਹੈ?", "ਸਾਡੇ ਸਭ ਦਾ ਦਰਦ", "ਦਿਲ ਨੂੰ ਛੂਹ ਗਿਆ", "ਸੱਚ ਦੱਸਦਾਂ"
HUSTLE CULTURE: "ₓ ਘੰਟੇ ਕੰਮ ਤੋਂ ਬਾਅਦ ਸਿੱਖਿਆ", "failure ਸਭ ਤੋਂ ਵੱਡਾ teacher ਹੈ", "grind season ਸ਼ੁਰੂ", "ਪਾਜੀ ₹0 ਤੋਂ ₹X ਤੱਕ — process ਸੁਣੇਂਗਾ?"
DILJIT-CODED: "Diljit ਵਾਂਗੂ worldwide go", "Patiala peg swag", "ਟਰਬਾਨ game on point", "ਕਿਹਾ ਸੀ ਦੁਨੀਆ ਦੇਖੇਗੀ"
NRI/CANADA RELATABLE: "Brampton ਵਾਲੇ ਸਮਝਣਗੇ", "ਘਰ ਦੀ ਯਾਦ ਆਉਂਦੀ ਹੈ ਨਾ?", "ਦੇਸ਼ ਤੋਂ ਦੂਰ ਹੋ ਕੇ ਵੀ ਦਿਲੋਂ ਪੰਜਾਬੀ"

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
- Direct command: "ਇਹ save ਕਰ ਲੈ, ਬਾਅਦ ਵਿੱਚ ਕੰਮ ਆਊਗਾ"
- "Punjabi by heart" energy: "ਦੁਨੀਆ ਦੇ ਕਿਸੇ ਵੀ ਕੋਨੇ ਵਿੱਚ ਹੋਵੇ — ਦਿਲੋਂ ਪੰਜਾਬੀ ਰਹਿੰਦਾ ਹੈ 🧡"
- Canada diaspora: "Brampton ਤੋਂ ਲੈ ਕੇ Bengaluru ਤੱਕ — ਇਹ ਪੰਜਾਬੀ creator ਦੀ ਕਹਾਣੀ ਹੈ"
- Bhangra culture: "Bhangra ਵਾਂਗੂ life ਵਿੱਚ ਵੀ rhythm ਚਾਹੀਦੀ ਹੈ — ਇਹ ਸੁਣ ਪਾਜੀ 🥁"
- Diljit reference: "Diljit ਨੇ ਕਿਹਾ ਸੀ — ਜੋ ਬਣਨਾ ਚਾਹੁੰਦੇ ਹੋ, ਬਣ ਜਾਓ। ਇਹ ਉਹੀ ਗੱਲ ਹੈ।"`,

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

✅ GOOD — Instagram (Diljit reference / Punjabi pride energy):
"Diljit ਨੇ Coachella stage ਤੇ ਪੱਗ ਬੰਨ੍ਹ ਕੇ ਦੁਨੀਆ ਜਿੱਤੀ 🎤

ਕੋਈ ਨਹੀਂ ਸੋਚਦਾ ਸੀ ਕਿ ਪੰਜਾਬੀ music ਇੱਥੇ ਪਹੁੰਚੇਗਾ।
ਪਰ ਉਹਨੇ ਆਪਣਾ authentic self ਰੱਖਿਆ — ਅਤੇ ਦੁਨੀਆ ਨੇ ਸੁਣੀ।

ਤੇਰੀ content ਦੀ ਵੀ ਇਹੀ ਕਹਾਣੀ ਹੋ ਸਕਦੀ ਹੈ, ਯਾਰ।
Authentic ਰਹਿ — ਬਾਕੀ ਆਪੇ ਹੋਵੇਗਾ 💯

Tag ਕਰੋ ਉਸ creator ਨੂੰ ਜੋ ਇਹ ਸੁਣਨ ਦੀ ਲੋੜ ਹੈ 👇

#DiljitDosanjh #PunjabiPride #PunjabiCreator #BalleBalle"

❌ BAD:
- "ਅਸੀਂ ਤੁਹਾਨੂੰ ਸੂਚਿਤ ਕਰਦੇ ਹਾਂ..." → stiff formal
- "Main sikhiya ki bahut important hai" → Romanized — use Gurmukhi`,

  platformBlocks: {
    linkedin: `PUNJABI + LINKEDIN:
- Hook in Punglish; ਤੁਸੀਂ-based. Short paragraphs; 5–7 hashtags; end with question.`,
    instagram: `PUNJABI + INSTAGRAM:
- Killer first line. High-energy Punjabi hook. ਬੱਲੇ ਬੱਲੇ vibe.
- Structure: [HOOK] → [Story/value] → [CTA: Save ਕਰੋ/Share ਕਰੋ/Comment ਵਿੱਚ ਦੱਸੋ].
- 8–15 hashtags. Casual ਤੂੰ/ਯਾਰ tone.
- TONE OVERRIDE: If topic is serious/emotional/agricultural (ਕਿਸਾਨ, ਕਰਜ਼ਾ, grief, social injustice, ਮੌਤ), switch to grounded respectful tone — NO ਬੱਲੇ ਬੱਲੇ, use ਦਿਲ ਦੀ ਗੱਲ / ਸੱਚ ਦੱਸਣਾ hooks instead.`,
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
- Spoken Punglish; hook in 2 seconds; high ਬੱਲੇ ਬੱਲੇ energy; verbal Punjabi CTA.
- TONE OVERRIDE: If topic is serious/emotional/agricultural (ਕਿਸਾਨ, ਕਰਜ਼ਾ, grief, social injustice, ਮੌਤ), use grounded respectful tone — NO ਬੱਲੇ ਬੱਲੇ, NO excited energy. Use ਦਿਲ ਦੀ ਗੱਲ / ਸੱਚ ਦੱਸਣਾ hooks instead.`,
  },

  platformOverrides: {
    linkedin: `PUNJABI-SPECIFIC LINKEDIN:
- ਮੈਂ/ਮੇਰਾ is natural. End with: "ਤੁਹਾਡਾ ਤਜ਼ਰਬਾ ਕੀ ਰਿਹਾ?", "Comments ਵਿੱਚ ਦੱਸੋ"`,
    instagram: `PUNJABI-SPECIFIC INSTAGRAM:
- CTA: "Save ਕਰੋ", "Tag ਕਰੋ ਉਸ ਯਾਰ ਨੂੰ", "Comment ਵਿੱਚ ਦੱਸੋ"
- ਬੱਲੇ ਬੱਲੇ energy: dramatic, enthusiastic, loud-and-proud Punjabi vibe (serious topics: use ਦਿਲ ਛੂਹਣ ਵਾਲੀ ਗੱਲ CTA instead)`,
    tiktok: `PUNJABI-SPECIFIC TIKTOK:
- Hooks: "ਸੁਣੋ ਇਹ", "ਰੁਕੋ ਜ਼ਰਾ", "ਇਹ ਦੇਖੋ ਪਹਿਲਾਂ"
- End CTA: "Follow ਕਰੋ", "Save ਕਰੋ"`,
  },

  qcRules: `
PUNJABI/PUNGLISH QUALITY RULES:
- Gurmukhi consistency: Punjabi words MUST be in Gurmukhi script. Romanized = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Default energy: sound like a real Punjabi creator with ਬੱਲੇ ਬੱਲੇ energy.
- TONE AWARENESS: Serious/emotional/agrarian topics (ਕਿਸਾਨ, ਕਰਜ਼ਾ, grief, social injustice) = grounded respectful tone, NO ਬੱਲੇ ਬੱਲੇ. Forcing hype on sensitive topics = CRITICAL FAIL.
- TOPIC-AWARE SCRIPT: Cultural/agrarian/social topics (ਕਿਸਾਨ, ਵਾਢੀ, ਪਿੰਡ, social issues) → Gurmukhi-dominant (~85% Gurmukhi, only unavoidable English nouns that have no Punjabi equivalent). Tech/startup/business → Punglish (~55% Punjabi / ~45% English).
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
