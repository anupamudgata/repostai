import type { RegionalLanguageConfig } from "./types";

export const BENGALI_CONFIG: RegionalLanguageConfig = {
  code: "bn",
  name: "Bengali",
  nativeName: "বাংলা",
  script: "Bengali",
  mixName: "Benglish",
  codeSwitchRatio: "~55% Bengali / ~45% English",
  formalPronoun: "আপনি",
  casualPronoun: "তুমি/তুই",
  englishTermsNote: "startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog",
  commonNativeWords: "করা, হওয়া, শেখা, অনেক, কিন্তু, কারণ, আনন্দ, সময়, কাজ, জীবন, আমি, তুমি, আমরা, সবচেয়ে, আগে, পরে, এখন, ভাই, বন্ধু",
  scriptExamples: {
    correct: [
      "Startup life এ এটা অনেক important",
      "আমি শিখলাম — customers রা features চায় না, solution চায়",
      "Content create করা easy, কিন্তু consistent থাকা — সেটাই real game",
    ],
    wrong: [
      "Startup life e eta onek important (Romanized — use Bengali script!)",
      "সূচনাকালীন জীবনে এটি অত্যন্ত গুরুত্বপূর্ণ (over-formal Shuddh Bengali)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Bengali creator:

1) CULTURAL REFERENCES:
   - Kolkata: "আড্ডা culture", Park Street vibes, Howrah Bridge metaphors, tram nostalgia, College Street wisdom
   - Literature: Rabindranath casual quotes, Satyajit Ray observations, বাংলা pride
   - Food: "রসগোল্লা diplomacy", মিষ্টি দই, ইলিশ মাছের season, "ফুচকা vs পানিপুরি" debate
   - Festivals: Durga Puja energy, Saraswati Puja, Poila Boishakh celebration
   - Cricket/Football: "মোহনবাগান spirit", East Bengal rivalry, Sourav Ganguly references

2) BENGALI INTERNET CULTURE:
   - "দাদা", "দিদি", "ভাই" — respectful address
   - Intellectual undertone: Bengalis love analysis, debate, nuanced takes
   - "আড্ডা" energy: conversation-driven, storytelling focus, opinion-heavy

3) AUDIENCE REGISTERS:
   - Startup/tech: heavy English, "basically এটা pivot হয়ে গেছে"
   - Students: trendy, meme-aware, casual
   - Professionals: measured Benglish, আপনি-based, analytical
   - Creative/arts: literary flair OK, Rabindranath-inspired warmth`,

  slangVocabulary: `BENGALI SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: দারুণ ("এটা তো দারুণ!"), জব্বর, মাথা নষ্ট, ফাটাফাটি, সুপার, অসাধারণ
SURPRISE: মাথা ঘুরে গেল, পাগল হয়ে যাব, কী বলবো, হতবাক
CASUAL ADDRESS: দাদা, ভাই, বন্ধু, বস, রে
HUSTLE: জোগাড়, পয়সা উসুল, ফর্মুলা, ট্রিক, হ্যাক
AGREEMENT: একদম, সঠিক, পুরোপুরি, পাক্কা, লিখে রাখো
DISMISSAL: ছোড়, বাজে কথা, সময় নষ্ট, ফালতু
RELATABLE: relate করো, আমাদের সবার story, আসল কথা
DRAMA: "picture এখনো বাকি", "এটা তো trailer ছিল", "climax আসছে"

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally
- LinkedIn: sparingly ("দারুণ result", "জব্বর framework")
- Reddit: minimal, sound helpful
- ALWAYS in Bengali script — never "darun", always "দারুণ"`,

  openingVariety: `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. Rotate through DIFFERENT hook styles:
- Bold contrarian: "সবাই ভাবে X, কিন্তু সত্যি কথা হলো Y"
- Stat/number: "97% creators এই ভুল করে"
- Story cold open: "গতকাল রাত 2টায় একটা DM আসলো..."
- Cultural reference: "ঠিক যেমন IPL এর last over এ সব বদলে যায়..."
- Question: "তোমার content 100 জন পর্যন্ত পৌঁছাচ্ছে না, তাহলে কার জন্য বানাচ্ছো?"
- Observation: "একটা pattern দেখলাম — যারা daily post করে..."
- Direct command: "এটা save করো, পরে কাজে লাগবে"`,

  fewShotExamples: `
FEW-SHOT (style reference — NEVER copy verbatim):

✅ GOOD — LinkedIn:
"Product বানাতে সবচেয়ে বড় trap: 'আরেকটা feature add করে নিই' 🚀

3 বছর SaaS build করার পর বুঝলাম — customers features চায় না, problem solve চায়।

এখন rule simple: user 3 বার না চাইলে build করবো না।

আপনার team এ এরকম কোন feature আছে যেটা বানিয়েছেন কিন্তু কেউ use করে না?

#SaaS #StartupIndia #BuildInPublic #KolkataStartups"

✅ GOOD — Instagram:
"Gym যাওয়া easy 💪
Gym যেতে থাকা — সেটাই real game

বৃষ্টি হোক, ঠান্ডা হোক, meeting হোক — consistency রাখলে results আসে 🔥

Save করো আর daily নিজেকে মনে করাও 📌

#FitnessMotivation #BengaliCreator #GymLife"

✅ GOOD — X/Twitter:
"AI tools use করা advantage না। সঠিক AI tool সঠিক কাজে use করা — সেটা advantage।"

✅ GOOD — WhatsApp Status:
"Content বানানোর চেয়ে content distribute করা বেশি important। একটা ভালো post 5 platforms এ দাও 💡"

❌ BAD:
- "আমরা আপনাকে জানাচ্ছি যে..." → stiff formal Bengali
- "Ami shikhlam ki onek important" → Romanized Bengali — use Bengali script`,

  platformBlocks: {
    linkedin: `BENGALI + LINKEDIN:
- Length ~250–400 words. Hook in Benglish; আপনি-based.
- Short paragraphs; 2–3 emojis max; 5–7 mixed hashtags; end with question.`,
    instagram: `BENGALI + INSTAGRAM:
- Killer first line. Scroll-stopping Bengali hook. Energetic tone.
- Structure: [HOOK] → [Story/value] → [CTA: Save করো/Share করো/Comment এ বলো].
- 8–15 hashtags. Casual তুমি/রে tone.`,
    twitter: `BENGALI + X:
- Thread: numbered, each <280 chars, strong Benglish hook.
- Single: <260 chars, punchy.`,
    facebook: `BENGALI + FACEBOOK:
- আড্ডা-style warm tone; 150–300 words; easy comment prompt.`,
    whatsapp: `BENGALI + WHATSAPP STATUS:
- 50–100 words max; conversational; 3–5 emojis; one CTA.`,
    email: `BENGALI + EMAIL:
- Subject curiosity-driven in Benglish; body scannable; ONE CTA.`,
    reddit: `BENGALI + REDDIT:
- Helpful, non-promotional; Benglish OK; no hashtags.`,
    tiktok: `BENGALI + TIKTOK SCRIPT:
- Spoken Benglish; hook in first 2 seconds; short lines; verbal Bengali CTA.`,
  },

  platformOverrides: {
    linkedin: `BENGALI-SPECIFIC LINKEDIN:
- মই/আমার is natural — "Never start with I" does NOT apply
- End with: "আপনার অভিজ্ঞতা কী?", "Comments এ জানান"
- আপনি-based professional Benglish`,
    instagram: `BENGALI-SPECIFIC INSTAGRAM:
- CTA in Bengali: "Save করো", "Tag করো সেই বন্ধুকে", "Comment এ বলো"
- Casual তুমি/রে tone`,
    tiktok: `BENGALI-SPECIFIC TIKTOK:
- Spoken Benglish hooks: "শোনো এটা", "দাঁড়াও একটু", "এটা দেখো আগে"
- End CTA: "Follow করো", "Save করো"`,
  },

  qcRules: `
BENGALI/BENGLISH QUALITY RULES:
- Bengali script consistency: Bengali words MUST be in Bengali script. Romanized = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Must sound like a real Bengali creator, not translated English.
- LinkedIn = আপনি professional. Instagram = casual তুমি/রে.`,

  extractorGuard: `
BENGALI OUTPUT CONTEXT:
- The brief will generate Benglish content.
- Preserve Bengali idioms, cultural references (Kolkata, Durga Puja, আড্ডা, cricket), Benglish phrases.
- Keep JSON keys in English. Values can be in Benglish.`,

  photoCaptionHint: `Natural Benglish — write like Bengali creators post.
- Bengali words in Bengali script. English tech terms stay Latin.
- Use Bengali cultural refs naturally: রসগোল্লা, Kolkata vibes, Durga Puja.`,
};
