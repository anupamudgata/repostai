import type { RegionalLanguageConfig } from "./types";

export const KANNADA_CONFIG: RegionalLanguageConfig = {
  code: "kn",
  name: "Kannada",
  nativeName: "ಕನ್ನಡ",
  script: "Kannada",
  mixName: "Kanglish",
  codeSwitchRatio: "~50% Kannada / ~50% English",
  formalPronoun: "ನೀವು",
  casualPronoun: "ನೀನು/ಮಚ್ಚಿ/ಮಗಾ",
  englishTermsNote: "startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog",
  commonNativeWords: "ಮಾಡು, ಆಗು, ಕಲಿ, ತುಂಬಾ, ಆದರೆ, ಯಾಕೆಂದರೆ, ಸಂತೋಷ, ಸಮಯ, ಕೆಲಸ, ಜೀವನ, ನಾನು, ನೀನು, ನಾವು, ಮೊದಲು, ನಂತರ, ಈಗ, ಮಚ್ಚಿ, ಗೆಳೆಯ, ಅಣ್ಣ",
  scriptExamples: {
    correct: [
      "Startup life ಅಲ್ಲಿ ಇದು ತುಂಬಾ important",
      "ನಾನು ಕಲಿತೆ — customers ಗೆ features ಬೇಡ, solution ಬೇಕು",
      "Content create ಮಾಡೋದು easy, ಆದರೆ consistent ಆಗಿರೋದು — ಅದೇ real game",
    ],
    wrong: [
      "Startup life alli idu tumba important (Romanized — use Kannada script!)",
      "ಆರಂಭಿಕ ಜೀವನದಲ್ಲಿ ಇದು ಅತ್ಯಂತ ಮಹತ್ವಪೂರ್ಣವಾಗಿದೆ (over-formal literary Kannada)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Kannada creator:

1) CULTURAL REFERENCES:
   - Bangalore: "Namma Bengaluru" tech culture, "traffic ಅಲ್ಲಿ life lessons", Koramangala/Indiranagar vibes, IT park humor
   - Sandalwood: Rajkumar references, Yash/KGF energy, Kannada cinema pride
   - Food: "filter coffee > Starbucks", ಬಿಸಿಬೇಳೆಬಾತ್, ಮಸಾಲೆ ದೋಸೆ, "Vidyarthi Bhavan ಅಲ್ಲಿ breakfast"
   - Festivals: Dasara (Mysuru), Ugadi planning, Rajyotsava pride, ಕರಗ
   - Heritage: Mysuru palace, Hampi, Kannada ನುಡಿ pride, "ಕನ್ನಡ ರಾಜ್ಯೋತ್ಸವ"

2) KANNADA INTERNET CULTURE:
   - "ಮಚ್ಚಿ", "ಮಗಾ", "ಅಣ್ಣ" — casual address (Bangalore slang)
   - Tech-savvy: Bangalore has massive tech creator community, bring that energy
   - Startup humor: "ek cup coffee ಬರ್ತೀರಾ?" networking culture, "hustle culture vs filter coffee culture"

3) AUDIENCE REGISTERS:
   - Startup/tech: heavy English, "basically ಇದು pivot ಆಗಿದೆ"
   - Students: trendy, casual, meme-aware
   - Professionals: measured Kanglish, ನೀವು-based
   - Local business: more Kannada, warm, community-driven`,

  slangVocabulary: `KANNADA SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: ಮಸ್ತ್ ("ಇದು ಮಸ್ತ್ ಇದೆ!"), ಸೂಪರ್, ಭಾರೀ, ಅದ್ಭುತ, ಕಿಲ್ಲರ್, ಫುಲ್ ಪವರ್
SURPRISE: ತಲೆ ಕೆಟ್ಟಿತು, ಶಾಕ್ ಆಯ್ತು, ನಂಬಕ್ಕಾಗಲ್ಲ, ಹುಚ್ಚು
CASUAL ADDRESS: ಮಚ್ಚಿ, ಮಗಾ, ಅಣ್ಣ, ಬಾಸ್, ಗೆಳೆಯ
HUSTLE: ಜುಗಾಡ್, ಪೈಸಾ ವಸೂಲ್, ಟ್ರಿಕ್, ಹ್ಯಾಕ್
AGREEMENT: ಖಂಡಿತ, ಕರೆಕ್ಟ್, 100%, ಪಕ್ಕಾ, ಬರೆದಿಟ್ಟುಕೊ
DISMISSAL: ಬಿಡು, ಬೇಕಾರ್, ಟೈಮ್ ವೇಸ್ಟ್, ಫಾಲ್ತು
DRAMA: "picture ಇನ್ನೂ ಬಾಕಿ ಇದೆ", "ಇದು trailer ಮಾತ್ರ", "climax ಬರ್ತಿದೆ"

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally
- LinkedIn: sparingly ("ಮಸ್ತ್ result", "ಸೂಪರ್ framework")
- ALWAYS in Kannada script — never "mastu", always "ಮಸ್ತ್"`,

  openingVariety: `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. Rotate:
- Bold contrarian: "ಎಲ್ಲರಿಗೂ X ಅನ್ನಿಸುತ್ತೆ, ಆದರೆ ನಿಜ ಏನೆಂದರೆ Y"
- Stat/number: "97% creators ಈ mistake ಮಾಡ್ತಾರೆ"
- Story cold open: "ನಿನ್ನೆ ರಾತ್ರಿ 2 ಗಂಟೆಗೆ ಒಂದು DM ಬಂತು..."
- Question: "ನಿನ್ನ content 100 ಜನಕ್ಕೆ reach ಆಗ್ತಿಲ್ಲ, ಹಾಗಾದರೆ ಯಾರಿಗಾಗಿ create ಮಾಡ್ತಿದ್ದೀಯ?"
- Direct command: "ಇದನ್ನ save ಮಾಡಿಕೊ, ನಂತರ useful ಆಗುತ್ತೆ"`,

  fewShotExamples: `
FEW-SHOT (style reference — NEVER copy verbatim):

✅ GOOD — LinkedIn:
"Product build ಮಾಡೋವಾಗ biggest trap: 'ಇನ್ನೊಂದು feature add ಮಾಡೋಣ' 🚀

3 ವರ್ಷ SaaS build ಮಾಡಿದ ಮೇಲೆ ಅರ್ಥ ಆಯ್ತು — customers ಗೆ features ಬೇಡ, problem solve ಬೇಕು.

ಈಗ rule simple: user 3 ಸಲ ಕೇಳದಿದ್ದರೆ build ಮಾಡಲ್ಲ.

ನಿಮ್ಮ team ಅಲ್ಲಿ ಇಂಥ feature ಇದೆಯಾ?

#SaaS #StartupIndia #NammaBengaluru #BuildInPublic"

✅ GOOD — Instagram:
"Gym ಗೆ ಹೋಗೋದು easy 💪
Gym ಗೆ ಹೋಗ್ತಾ ಇರೋದು — ಅದೇ real game 🔥

Save ಮಾಡಿಕೊ 📌

#FitnessMotivation #BengaluruGym #KannadaCreator"

✅ GOOD — X/Twitter:
"AI tools use ಮಾಡೋದು advantage ಅಲ್ಲ. ಸರಿಯಾದ AI tool ಸರಿಯಾದ ಕೆಲಸಕ್ಕೆ use ಮಾಡೋದು — ಅದೇ advantage."

✅ GOOD — WhatsApp Status:
"Content create ಮಾಡೋದಕ್ಕಿಂತ distribute ಮಾಡೋದು important. ಒಂದು ಒಳ್ಳೆ post 5 platforms ಅಲ್ಲಿ ಹಾಕು 💡"

❌ BAD:
- "ನಾವು ನಿಮಗೆ ತಿಳಿಸುತ್ತಿದ್ದೇವೆ..." → stiff formal
- "Naanu kalithe ki tumba important" → Romanized — use Kannada script`,

  platformBlocks: {
    linkedin: `KANNADA + LINKEDIN:
- Hook in Kanglish; ನೀವು-based. Short paragraphs; 5–7 hashtags; end with question.`,
    instagram: `KANNADA + INSTAGRAM:
- Killer first line. Energetic Kannada hook.
- Structure: [HOOK] → [Story/value] → [CTA: Save ಮಾಡಿಕೊ/Share ಮಾಡು/Comment ಅಲ್ಲಿ ಹೇಳು].
- 8–15 hashtags. Casual ನೀನು/ಮಚ್ಚಿ tone.`,
    twitter: `KANNADA + X:
- Thread: numbered, <280 chars, Kanglish hook. Single: <260 chars.`,
    facebook: `KANNADA + FACEBOOK:
- Community tone; 150–300 words; comment prompt.`,
    whatsapp: `KANNADA + WHATSAPP STATUS:
- 50–100 words; conversational; one CTA.`,
    email: `KANNADA + EMAIL:
- Curiosity-driven Kanglish subject; scannable body; ONE CTA.`,
    reddit: `KANNADA + REDDIT:
- Helpful, non-promotional; no hashtags.`,
    tiktok: `KANNADA + TIKTOK SCRIPT:
- Spoken Kanglish; hook in 2 seconds; high energy; verbal Kannada CTA.`,
  },

  platformOverrides: {
    linkedin: `KANNADA-SPECIFIC LINKEDIN:
- ನಾನು/ನನ್ನ is natural. End with: "ನಿಮ್ಮ ಅನುಭವ ಏನು?", "Comments ಅಲ್ಲಿ ಹೇಳಿ"`,
    instagram: `KANNADA-SPECIFIC INSTAGRAM:
- CTA: "Save ಮಾಡಿಕೊ", "Tag ಮಾಡು ಆ friend ನ", "Comment ಅಲ್ಲಿ ಹೇಳು"`,
    tiktok: `KANNADA-SPECIFIC TIKTOK:
- Hooks: "ಕೇಳು ಇದನ್ನ", "ನಿಲ್ಲು ಒಂದ್ ನಿಮಿಷ", "ಇದು ನೋಡು ಮೊದಲು"`,
  },

  qcRules: `
KANNADA/KANGLISH QUALITY RULES:
- Kannada script consistency: Kannada words MUST be in Kannada script. Romanized = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Must sound like a real Kannada/Bangalore creator.
- LinkedIn = ನೀವು professional. Instagram = casual ನೀನು/ಮಚ್ಚಿ.`,

  extractorGuard: `
KANNADA OUTPUT CONTEXT:
- The brief will generate Kanglish content.
- Preserve Kannada idioms, cultural references (Bangalore, Mysuru, Sandalwood, filter coffee).
- Keep JSON keys in English. Values can be in Kanglish.`,

  photoCaptionHint: `Natural Kanglish — write like Bangalore creators post.
- Kannada words in Kannada script. English tech terms stay Latin.
- Use refs: filter coffee, Namma Bengaluru, Sandalwood.`,
};
