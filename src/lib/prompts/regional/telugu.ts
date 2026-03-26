import type { RegionalLanguageConfig } from "./types";

export const TELUGU_CONFIG: RegionalLanguageConfig = {
  code: "te",
  name: "Telugu",
  nativeName: "తెలుగు",
  script: "Telugu",
  mixName: "Tenglish",
  codeSwitchRatio: "~50% Telugu / ~50% English",
  formalPronoun: "మీరు",
  casualPronoun: "నువ్వు/రా/రోయ్",
  englishTermsNote: "startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog",
  commonNativeWords: "చేయడం, అవడం, నేర్చుకోవడం, చాలా, కానీ, ఎందుకంటే, సంతోషం, సమయం, పని, జీవితం, నేను, నువ్వు, మేము, ముందు, తర్వాత, ఇప్పుడు, బ్రో, అన్న, మిత్రమా",
  scriptExamples: {
    correct: [
      "Startup life లో ఇది చాలా important",
      "నేను నేర్చుకున్నా — customers కి features వద్దు, solution కావాలి",
      "Content create చేయడం easy, కానీ consistent గా ఉండటం — అదే real game",
    ],
    wrong: [
      "Startup life lo idi chala important (Romanized — use Telugu script!)",
      "ప్రారంభ జీవితంలో ఇది అత్యంత ముఖ్యమైనది (over-formal literary Telugu)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Telugu creator:

1) CULTURAL REFERENCES:
   - Hyderabad: biryani culture, "Hyderabadi dum", old city charm, HITEC City tech vibes, "traffic lo life lessons"
   - Tollywood: RRR energy, Baahubali references, Allu Arjun swag, "Pushpa style", mass hero dialogues
   - Food: "biryani > everything", "పెసరట్టు + upma", "gongura pachadi", Irani chai
   - Festivals: Sankranti energy, Bathukamma, Ugadi planning, Bonalu celebrations
   - Tech hub: Hyderabad IT corridor, "TCS/Infosys batch mates", coding culture

2) TELUGU INTERNET CULTURE:
   - "బ్రో", "అన్నా", "రోయ్" — casual address
   - Mass appeal: Telugu creators love high-energy, dramatic, entertaining content
   - YouTube dominance: Telugu has massive YouTube creator ecosystem — bring that energy
   - Tollywood dialogues as punchlines: iconic dialogue inserts for emphasis

3) AUDIENCE REGISTERS:
   - Startup/tech: heavy English, "basically ఇది pivot అయిపోయింది"
   - Students: trendy, exam memes, casual
   - Professionals: measured Tenglish, మీరు-based
   - Entertainment/mass: Tollywood energy, dramatic, high-emotion`,

  slangVocabulary: `TELUGU SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: అదిరిపోయింది ("ఇది అదిరిపోయింది!"), మస్తు, సూపర్, భలే, కేకపెట్టించేది, దిమ్మతిరిగేది
SURPRISE: దిమ్మతిరిగింది, షాక్ అయ్యా, నమ్మలేకపోతున్నా, పిచ్చెక్కించేది
CASUAL ADDRESS: బ్రో, అన్నా, రోయ్, మిత్రమా, బాబు
HUSTLE: జుగాడ్, పైసా వసూల్, ట్రిక్, హ్యాక్, ఫార్ములా
AGREEMENT: అవునవును, కరెక్ట్, 100%, పక్కా, రాసిపెట్టుకో
DISMISSAL: వదిలెయ్, బేకార్, టైం వేస్ట్, ఫాలతు
RELATABLE: relate అవుతుంది, మన అందరి story, నిజమైన మాట
DRAMA: "picture ఇంకా బాకీ ఉంది", "ఇది trailer మాత్రమే", "climax రాబోతుంది"

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally — Telugu audience loves mass energy
- LinkedIn: sparingly ("మస్తు result", "సూపర్ framework")
- Reddit: minimal
- ALWAYS in Telugu script — never "adiripoindi", always "అదిరిపోయింది"`,

  openingVariety: `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. Rotate:
- Bold contrarian: "అందరికీ X అనిపిస్తుంది, కానీ నిజం ఏంటంటే Y"
- Stat/number: "97% creators ఈ mistake చేస్తారు"
- Story cold open: "నిన్న రాత్రి 2 గంటలకు ఒక DM వచ్చింది..."
- Cultural reference: "IPL లో last over లో అంతా మారిపోతుంది, అలాగే..."
- Question: "నీ content 100 మందికి reach అవ్వట్లేదు, అయితే ఎవరికోసం create చేస్తున్నావ్?"
- Direct command: "ఇది save చేసుకో, తర్వాత పనికొస్తుంది"`,

  fewShotExamples: `
FEW-SHOT (style reference — NEVER copy verbatim):

✅ GOOD — LinkedIn:
"Product build చేసేటప్పుడు biggest trap: 'ఇంకో feature add చేద్దాం' 🚀

3 సంవత్సరాలు SaaS build చేసాక అర్థమైంది — customers కి features వద్దు, problem solve కావాలి.

ఇప్పుడు rule simple: user 3 సార్లు అడగకపోతే build చేయం.

మీ team లో ఇలాంటి feature ఉందా?

#SaaS #StartupIndia #HyderabadTech"

✅ GOOD — Instagram:
"Gym కి వెళ్ళడం easy 💪
Gym కి వెళ్తూ ఉండటం — అదే real game

వర్షం పడినా, చలిగా ఉన్నా, meeting ఉన్నా — consistency ఉంటే results వస్తాయి 🔥

Save చేసుకో 📌

#FitnessMotivation #TeluguCreator #GymLife"

✅ GOOD — X/Twitter:
"AI tools use చేయడం advantage కాదు. సరైన AI tool సరైన పనికి use చేయడం — అదే advantage."

✅ GOOD — WhatsApp Status:
"Content create చేయడం కంటే distribute చేయడం important. ఒక మంచి post 5 platforms లో పెట్టు 💡"

❌ BAD:
- "మేము మీకు తెలియజేయుచున్నాము..." → stiff literary Telugu
- "Nenu nerchukunna ki chala important" → Romanized — use Telugu script`,

  platformBlocks: {
    linkedin: `TELUGU + LINKEDIN:
- Length ~250–400 words. Hook in Tenglish; మీరు-based.
- Short paragraphs; 2–3 emojis; 5–7 hashtags; end with question.`,
    instagram: `TELUGU + INSTAGRAM:
- Killer first line. Mass-appeal Telugu hook. Energetic Tollywood energy.
- Structure: [HOOK] → [Story/value] → [CTA: Save చేసుకో/Share చెయ్యి/Comment లో చెప్పు].
- 8–15 hashtags. Casual నువ్వు/రా tone.`,
    twitter: `TELUGU + X:
- Thread: numbered, <280 chars each, punchy Tenglish hook.
- Single: <260 chars, one sharp idea.`,
    facebook: `TELUGU + FACEBOOK:
- Warm community tone; 150–300 words; easy comment prompt.`,
    whatsapp: `TELUGU + WHATSAPP STATUS:
- 50–100 words max; conversational; one CTA.`,
    email: `TELUGU + EMAIL:
- Subject curiosity-driven in Tenglish; body scannable; ONE CTA.`,
    reddit: `TELUGU + REDDIT:
- Helpful, non-promotional; Tenglish OK; no hashtags.`,
    tiktok: `TELUGU + TIKTOK SCRIPT:
- Spoken Tenglish; hook in first 2 seconds; high-energy Tollywood vibe; verbal Telugu CTA.`,
  },

  platformOverrides: {
    linkedin: `TELUGU-SPECIFIC LINKEDIN:
- నేను/నా is natural — "Never start with I" does NOT apply
- End with: "మీ అనుభవం ఏంటి?", "Comments లో చెప్పండి"`,
    instagram: `TELUGU-SPECIFIC INSTAGRAM:
- CTA in Telugu: "Save చేసుకో", "Tag చెయ్యి", "Comment లో చెప్పు"
- Mass energy: dramatic, Tollywood-style hooks
- Casual నువ్వు/రా tone`,
    tiktok: `TELUGU-SPECIFIC TIKTOK:
- Hooks: "ఆగు ఒక్కసారి", "ఇది విను ముందు", "3 seconds ఇవ్వు"
- End CTA: "Follow చెయ్యి", "Save చేసుకో"`,
  },

  qcRules: `
TELUGU/TENGLISH QUALITY RULES:
- Telugu script consistency: Telugu words MUST be in Telugu script. Romanized = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Must sound like a real Telugu creator, not translated English.
- LinkedIn = మీరు professional. Instagram = casual నువ్వు/రా.`,

  extractorGuard: `
TELUGU OUTPUT CONTEXT:
- The brief will generate Tenglish content.
- Preserve Telugu idioms, cultural references (Hyderabad, Tollywood, biryani, cricket).
- Keep JSON keys in English. Values can be in Tenglish.`,

  photoCaptionHint: `Natural Tenglish — write like Telugu creators post.
- Telugu words in Telugu script. English tech terms stay Latin.
- Use Telugu cultural refs: biryani, Tollywood, Hyderabad vibes.`,
};
