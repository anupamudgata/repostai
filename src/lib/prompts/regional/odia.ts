import type { RegionalLanguageConfig } from "./types";

export const ODIA_CONFIG: RegionalLanguageConfig = {
  code: "or",
  name: "Odia",
  nativeName: "ଓଡ଼ିଆ",
  script: "Odia",
  mixName: "Odianglish",
  codeSwitchRatio: "~55% Odia / ~45% English",
  formalPronoun: "ଆପଣ",
  casualPronoun: "ତୁ/ତୁମେ",
  englishTermsNote: "startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog",
  commonNativeWords: "କରିବା, ହେବା, ଶିଖିବା, ବହୁତ, କିନ୍ତୁ, କାରଣ, ଖୁସି, ସମୟ, କାମ, ଜୀବନ, ମୁଁ, ତୁମେ, ଆମେ, ସବୁଠାରୁ, ଆଗରୁ, ପରେ, ବର୍ତ୍ତମାନ, ଭାଇ, ବନ୍ଧୁ",
  scriptExamples: {
    correct: [
      "Startup life ରେ ଏହା ବହୁତ important",
      "ମୁଁ ଶିଖିଲି — customers ଙ୍କୁ features ଦରକାର ନାହିଁ, solution ଦରକାର",
      "Content create କରିବା easy, କିନ୍ତୁ consistent ରହିବା — ସେଇଟା real game",
    ],
    wrong: [
      "Startup life re eha bahut important (Romanized — use Odia script!)",
      "ଆରମ୍ଭିକ ଜୀବନରେ ଏହା ଅତ୍ୟନ୍ତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ (over-formal literary Odia)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Odia creator:

1) CULTURAL REFERENCES:
   - Odisha: Jagannath Puri pride, Konark Sun Temple, Chilika Lake beauty, Bhubaneswar modern city
   - Festivals: Rath Yatra energy, Raja festival, Nuakhai celebrations, Kumar Purnima
   - Food: "ଦାଳମା > everything", ପଖାଳ in summer, ରସଗୋଲା debate (Odia vs Bengali), ଛେନା ପୋଡ଼
   - Culture: Odia literature pride, Sambalpuri culture, hockey heritage, Odissi dance elegance
   - Nature: Simlipal forests, Odisha beaches, monsoon beauty, Hirakud Dam

2) ODIA INTERNET CULTURE:
   - "ଭାଇ", "ବନ୍ଧୁ", "ଦାଦା" — warm address
   - Growing creator ecosystem: Odia YouTube and Instagram creators emerging fast
   - Pride in culture: "ଓଡ଼ିଶା ର pride" sentiment, regional identity

3) AUDIENCE REGISTERS:
   - Startup/tech: English-heavy, "basically ଏହା pivot ହୋଇଗଲା"
   - Students: casual, relatable, meme-aware
   - Professionals: measured Odianglish, ଆପଣ-based
   - Local business: more Odia, warm family tone`,

  slangVocabulary: `ODIA SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: ମଜା ("ଏହା ତ ମଜା!"), ସୁପର, ଝକାସ, ଜବରଦସ୍ତ, ଧମାକାଦାର, ଫାଟାଫାଟି
SURPRISE: ମୁଣ୍ଡ ଘୁରିଗଲା, ସକ ଲାଗିଲା, ପାଗଲ ହୋଇଗଲି, ବିଶ୍ୱାସ ହେଉନାହିଁ
CASUAL ADDRESS: ଭାଇ, ବନ୍ଧୁ, ଦାଦା, ବସ, ଯାର
HUSTLE: ଜୁଗାଡ, ପଇସା ୱସୂଲ, ଟ୍ରିକ, ହ୍ୟାକ
AGREEMENT: ବିଲକୁଲ, ସଠିକ, 100%, ପକ୍କା, ଲେଖି ରଖ
DISMISSAL: ଛାଡ, ବେକାର, ସମୟ ନଷ୍ଟ, ଫାଲତୁ
DRAMA: "picture ଆଉ ବାକି ଅଛି", "ଏହା trailer ଥିଲା", "climax ଆସୁଛି"

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally
- LinkedIn: sparingly
- ALWAYS in Odia script — never "maja", always "ମଜା"`,

  openingVariety: `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. Rotate:
- Bold contrarian: "ସମସ୍ତଙ୍କୁ ଲାଗୁଛି X, କିନ୍ତୁ ସତ ହେଉଛି Y"
- Stat/number: "97% creators ଏହି ଭୁଲ କରନ୍ତି"
- Story cold open: "ଗତକାଲି ରାତି 2ଟାରେ ଗୋଟେ DM ଆସିଲା..."
- Question: "ତୁମ content 100 ଲୋକଙ୍କ ପାଖରେ ପହଞ୍ଚୁ ନାହିଁ, ତେବେ କାହାପାଇଁ ବନାଉଛ?"
- Direct command: "ଏହା save କର, ପରେ କାମରେ ଆସିବ"`,

  fewShotExamples: `
FEW-SHOT (style reference — NEVER copy verbatim):

✅ GOOD — LinkedIn:
"Product ବନାଇବାରେ ସବୁଠାରୁ ବଡ trap: 'ଆଉ ଗୋଟେ feature add କରିଦେବା' 🚀

3 ବର୍ଷ SaaS build କରିବା ପରେ ବୁଝିଲି — customers ଙ୍କୁ features ଦରକାର ନାହିଁ, problem solve ଦରକାର.

ଆପଣଙ୍କ team ରେ ଏପରି feature ଅଛି କି?

#SaaS #StartupIndia #OdishaRising"

✅ GOOD — Instagram:
"Gym ଯିବା easy 💪
Gym ଯାଉଥିବା — ସେଇଟା real game 🔥

Save କର 📌

#FitnessMotivation #OdiaCreator"

✅ GOOD — WhatsApp Status:
"Content ବନାଇବା ଠାରୁ distribute କରିବା important. ଗୋଟେ ଭଲ post 5 platforms ରେ ଦେ 💡"

❌ BAD:
- "ଆମେ ଆପଣଙ୍କୁ ଜଣାଉଛୁ..." → stiff formal
- "Mu shikhili ki bahut important" → Romanized — use Odia script`,

  platformBlocks: {
    linkedin: `ODIA + LINKEDIN:
- Hook in Odianglish; ଆପଣ-based. Short paragraphs; 5–7 hashtags.`,
    instagram: `ODIA + INSTAGRAM:
- Energetic Odia hook. Structure: [HOOK] → [Story/value] → [CTA: Save କର/Share କର/Comment ରେ କହ].
- 8–15 hashtags. Casual ତୁ/ତୁମେ tone.`,
    twitter: `ODIA + X:
- Thread: numbered, <280 chars. Single: <260 chars.`,
    facebook: `ODIA + FACEBOOK:
- Warm community tone; comment prompt at end.`,
    whatsapp: `ODIA + WHATSAPP STATUS:
- 50–100 words; conversational; one CTA.`,
    email: `ODIA + EMAIL:
- Odianglish subject; scannable body; ONE CTA.`,
    reddit: `ODIA + REDDIT:
- Helpful, non-promotional; no hashtags.`,
    tiktok: `ODIA + TIKTOK SCRIPT:
- Spoken Odianglish; hook in 2 seconds; verbal Odia CTA.`,
  },

  platformOverrides: {
    linkedin: `ODIA-SPECIFIC LINKEDIN:
- ମୁଁ/ମୋର is natural. End with: "ଆପଣଙ୍କ ଅନୁଭବ କ'ଣ?", "Comments ରେ କୁହନ୍ତୁ"`,
    instagram: `ODIA-SPECIFIC INSTAGRAM:
- CTA: "Save କର", "Tag କର", "Comment ରେ କହ"`,
    tiktok: `ODIA-SPECIFIC TIKTOK:
- Hooks: "ଶୁଣ ଏହା", "ଅଟକ ଟିକେ", "ଏହା ଦେଖ ଆଗରୁ"`,
  },

  qcRules: `
ODIA/ODIANGLISH QUALITY RULES:
- Odia script consistency: Odia words MUST be in Odia script. Romanized = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Must sound like a real Odia creator.
- LinkedIn = ଆପଣ professional. Instagram = casual ତୁ/ତୁମେ.`,

  extractorGuard: `
ODIA OUTPUT CONTEXT:
- The brief will generate Odianglish content.
- Preserve Odia idioms, cultural references (Jagannath, Rath Yatra, ପଖାଳ).
- Keep JSON keys in English. Values can be in Odianglish.`,

  photoCaptionHint: `Natural Odianglish — write like Odia creators post.
- Odia words in Odia script. English tech terms stay Latin.
- Use Odia cultural refs: Jagannath, Puri, ପଖାଳ, Rath Yatra.`,
};
