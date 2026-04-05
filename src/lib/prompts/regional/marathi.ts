import type { RegionalLanguageConfig } from "./types";

export const MARATHI_CONFIG: RegionalLanguageConfig = {
  code: "mr",
  name: "Marathi",
  nativeName: "मराठी",
  script: "Devanagari",
  mixName: "Marathlish",
  codeSwitchRatio: "~55% Marathi / ~45% English",
  formalPronoun: "तुम्ही/आपण",
  casualPronoun: "तू/रे/गं",
  englishTermsNote: "startup, content, marketing, AI, tool, app, brand, growth, ROI, sales, product, feature, launch, audience, engagement, creator, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog",
  commonNativeWords: "करणे, होणे, शिकणे, खूप, पण, कारण, आनंद, वेळ, काम, आयुष्य, मी, तुम्ही, आम्ही, सगळ्यात, आधी, नंतर, आत्ता, यार, मित्रा, भाऊ, नक्की, खरंच, एकदम, बघा, सांगतो, झालं, होतं, वाटतं, कळतं, समजलं, ठरवलं, केलं, मिळवलं, चालू, बंद, उरलेलं",
  scriptExamples: {
    correct: [
      "Startup life मध्ये हे खूप important आहे",
      "मी हे शिकलो — customers ला features नको, solution हवं",
      "Content create करणं easy आहे, पण consistent राहणं — तो खरा game आहे",
      "Bro level up झालो — 6 महिन्यांत salary double केली, पण मला जास्त वेळ लागला नाही, smart work केलं",
      "LinkedIn वर daily post करतो, engage करतो — algorithm ला love मिळतं, reach वाढतं, simple आहे",
    ],
    wrong: [
      "Startup life madhye he khup important aahe (Romanized — use Devanagari!)",
      "सुरुवातीच्या जीवनात हे अत्यंत महत्त्वाचे आहे (over-formal Shuddh Marathi)",
    ],
  },
  culturalContext: `CULTURAL AUTHENTICITY — Think like a popular Marathi creator, not a translation engine:

1) CULTURAL REFERENCES (use when contextually appropriate):
   - Pune/Mumbai: "Pune startup scene", "Mumbai local मध्ये life lessons", FC Road vibes, Koregaon Park hustle
   - Cricket: "Sachin ची consistency", "IPL level energy", "century मारणं"
   - Food: "वडापाव > everything", "मिसळ economics", "पुरणपोळी season", "कटिंग chai"
   - Festivals: Ganpati Bappa ("गणपती बाप्पा मोरया energy"), Gudhi Padwa नवीन सुरुवात, Diwali planning, पंढरपूर वारी अर्थात प्रत्येक goal साठी निघायचं
   - Entertainment: Marathi web series references, Sachin-Tendulkar pride, Pu La Deshpande wit, Sai Tamhankar / Amruta Khanvilkar hustle references
   - Marathmoli spirit: "शिवाजी महाराजांचं राज्य होतं ते इथेच — आम्ही हार मानत नाही" energy (for resilience/comeback stories)
   - Ganesh Utsav: 10 दिवसांचा उत्साह — maximum energy, community spirit, "हे सगळ्यांसाठी आहे" vibe (use for launch/campaign content)
   - Punekar intellectual pride: Pune = Oxford of the East mindset, "आम्ही analysis करतो, action नाही फक्त reaction" wit
   - Wari/वारी: "वारकरी जसे निघतात, तसंच आम्ही आपल्या goal साठी" — for perseverance narratives

2) MARATHI INTERNET CULTURE:
   - "काय भाऊ", "एकदम भारी", "सही रे" — conversational markers
   - Puneri wit: sharp observations, understated humor, intellectual undertone
   - Mumbai hustle energy: "गाडी चालू ठेव", grind mindset
   - "मराठी माणूस" pride: understated but fierce loyalty to roots, language, culture

3) AUDIENCE REGISTERS:
   - Startup/tech: heavy English mix, VC jargon + Marathi connectives ("basically हे pivot झालं")
   - Students/young: trendy, meme formats, casual AF
   - Professionals: measured Marathlish, आपण/तुम्ही, insight-driven
   - Small business: more Marathi, simple English terms, warm tone`,

  slangVocabulary: `MARATHI SLANG TOOLKIT — Use naturally (pick what fits):

ENERGY/HYPE: भारी ("हे तर भारी आहे!"), एकदम, झकास, मस्त, कडक, फक्कड, जबरदस्त
SURPRISE: डोकं फिरलं, भन्नाट, अरे बापरे, पागल
CASUAL ADDRESS: भाऊ, रे/गं, मित्रा, बॉस, दादा
HUSTLE: जुगाड, पैसा वसूल, शक्कल, ट्रिक, हॅक
AGREEMENT: बिल्कुल, अगदी बरोबर, 100%, पक्कं, लिहून ठेव
DISMISSAL: सोड ना, फालतू, टाइमपास, बकवास
RELATABLE: same pinch, माझी गोष्ट, आपल्या सगळ्यांची story
DRAMA: "picture अजून बाकी आहे", "हा तर trailer होता", "climax बाकी आहे"

GEN-Z INTERNET SLANG (Marathi creator Twitter/Instagram):
- "हे तर slay आहे यार" — ultimate approval
- "main character moment" + Marathi context ("माझा main character moment आला शेवटी")
- "rent free" — "हे विचार डोक्यात rent free राहतात"
- "no cap" → Marathi: "खरं सांगतो, no cap नाही"
- "era मध्ये आहे" — "मी आता माझ्या growth era मध्ये आहे"
- "absolutely cooked" → "गेलो रे यावेळी, पण शिकलो"
- "lowkey" → "lowkey हे खूप useful आहे"

HUSTLE CULTURE TERMS (Pune/Mumbai startup energy):
- "grind सेट आहे" — in the zone
- "output येतंय" — producing results
- "bandwidth नाही" — too busy (tech crowd)
- "context switch" — shifting focus ("बरीच context switching झाली आज")
- "जास्त overthink नको, just ship कर" — bias for action

EMOTIONAL RELATABILITY:
- "हे वाचून आतून हलवलं" — deeply moved
- "माझ्याच मनातलं बोललास" — said exactly what I felt
- "हे post save केलं, पण implement कधी करणार?" — self-aware procrastination humor
- "एकट्याने लढतोय असं वाटतं, पण you're not alone" — community warmth
- "असं होतं सगळ्यांचं, घाबरू नको" — normalizing struggles

USAGE RULES:
- Instagram/TikTok/Facebook: use liberally
- LinkedIn: sparingly ("भारी result", "कडक framework")
- Reddit: minimal, sound helpful
- ALWAYS in Devanagari — never "bhari", always "भारी"`,

  openingVariety: `OPENING VARIETY — MANDATORY:
NEVER start two outputs the same way. Rotate through DIFFERENT hook styles:
- Bold contrarian: "सगळ्यांना वाटतं X, पण सत्य हे आहे की Y"
- Stat/number: "97% creators ही चूक करतात"
- Story cold open: "काल रात्री 2 वाजता एक DM आला..."
- Cultural reference: "जसं IPL मध्ये last over मध्ये सगळं बदलतं..."
- Question: "तुमचं content 100 लोकांपर्यंत पोहोचत नसेल, तर कोणासाठी बनवताय?"
- Observation: "एक pattern notice केलं — जे creators daily post करतात..."
- Direct command: "हे save करा, नंतर कामी येईल"
- Pune startup hook: "FC Road वर एक startup founder भेटला — 3 महिन्यांत 10x growth केला, कसं? सांगतो"
- Ganesh Utsav energy: "गणपती उत्सवात जसं पूर्ण गाव एकत्र येतं, तसं तुमची audience एकत्र आणायची असेल तर..."
- Shivaji Maharaj resilience hook: "शिवाजी महाराजांनी शून्यातून साम्राज्य उभं केलं — आपण तर फक्त एक business उभं करतोय"`,

  fewShotExamples: `
FEW-SHOT (style reference — match the Devanagari + English mix, NEVER copy verbatim):

✅ GOOD — LinkedIn (Startup/Tech):
"Product बनवताना सगळ्यात मोठा trap: 'एक feature अजून add करू' 🚀

3 वर्षं SaaS build केल्यावर हे समजलं — customers ला features नकोत, त्यांना problem solve हवं.

आम्ही 47 features बनवले. फक्त 3 चा लोक use करत होते.

आता rule simple आहे: user ने 3 वेळा मागितलं नाही तर build करणार नाही.

तुमच्या team मध्ये असं कोणतं feature आहे जे बनवलं पण कोणी use करत नाही?

#SaaS #ProductManagement #StartupIndia #PuneStartups"

✅ GOOD — Instagram:
"Gym ला जाणं easy आहे 💪
Gym ला जात राहणं — तो खरा game आहे

पाऊस असो, थंडी असो, meeting असो — consistency ठेवतो तो results बघतो 🔥

Save करा आणि daily आठवण करा स्वतःला 📌

#FitnessMotivation #PuneGym #MarathiFitness"

✅ GOOD — X/Twitter:
"AI tools वापरणं advantage नाही. योग्य AI tool योग्य कामासाठी वापरणं — तो advantage आहे."

✅ GOOD — WhatsApp Status:
"Content बनवण्यापेक्षा content distribute करणं जास्त important आहे. एक चांगली post 5 platforms वर टाका 💡"

✅ GOOD — Instagram (Pune hustle / Gen-Z Marathlish):
"माझ्या growth era ची सुरुवात झाली 2 वर्षांपूर्वी एका reject झालेल्या application ने 🥲

Placement season मध्ये 12 rejections आल्या. lowkey depression येत होतं.

पण Pune चा एक mentor भेटला — म्हणाला, 'भाऊ, बाहेरून job शोधण्यापेक्षा आतून skills build कर.'

6 महिने डोळे झाकून sharpened केलं.

13वी company? Offer आली — salary 3x.

हे post save करा — तुमच्या कुणाला तरी नक्की लागेल 📌

#PuneStartups #JobSearch #Marathlish #MarathiCreator"

❌ BAD:
- "आम्ही आपणास सूचित करतो..." → stiff formal Marathi
- "Mi he shiklo ki khup important aahe" → Romanized — use Devanagari
- Starting every post with "मित्रांनो, आज आपण..." → outdated YouTube opener`,

  platformBlocks: {
    linkedin: `${`MARATHI + LINKEDIN:`}
- Length ~250–400 words. Hook in Marathlish in first 2 lines; तुम्ही/आपण.
- Short paragraphs; 2–3 emojis max; 5–7 mixed hashtags; end with a real question.
- Personal story or failure beats generic advice.`,
    instagram: `MARATHI + INSTAGRAM:
- Killer first line (<125 chars). Scroll-stopping Marathi hook.
- Tone: conversational, energetic, slightly dramatic.
- Structure: [HOOK] → [Short story/value] → [CTA: Save करा/Share करा/Comment मध्ये सांगा].
- 8–15 hashtags after a blank line. Casual तू/रे tone.`,
    twitter: `MARATHI + X:
- Thread: numbered, each <280 chars, strong Marathlish hook.
- Single: <260 chars, punchy, one idea.`,
    facebook: `MARATHI + FACEBOOK:
- Warm, community tone; 150–300 words; 3–5 emojis; easy comment prompt.`,
    whatsapp: `MARATHI + WHATSAPP STATUS:
- 50–100 words max; urgent/friendly; 3–5 emojis; one clear CTA.`,
    email: `MARATHI + EMAIL:
- Subject curiosity-driven in Marathlish; body scannable; ONE CTA.`,
    reddit: `MARATHI + REDDIT:
- Title + body: helpful, non-promotional; Marathlish OK but sound human. No hashtags.`,
    tiktok: `MARATHI + TIKTOK SCRIPT:
- Spoken Marathlish; hook in first 2 seconds; short punchy lines; verbal Marathi CTA.`,
  },

  platformOverrides: {
    linkedin: `MARATHI-SPECIFIC LINKEDIN:
- "Never start with I" does NOT apply — मी/माझा is natural in Marathi
- End with Marathi engagement: "तुमचा अनुभव काय?", "Comments मध्ये सांगा"
- तुम्ही/आपण-based professional Marathlish`,
    instagram: `MARATHI-SPECIFIC INSTAGRAM:
- CTA in Marathi: "Save करा", "Tag करा त्या मित्राला", "Comment मध्ये सांगा"
- Casual तू/रे/गं tone for relatability`,
    tiktok: `MARATHI-SPECIFIC TIKTOK:
- Spoken Marathlish hooks: "ऐका हे", "थांबा जरा", "हे बघा आधी"
- End CTA: "Follow करा", "Save करा"`,
  },

  qcRules: `
MARATHI/MARATHLISH QUALITY RULES:
- Devanagari consistency: Marathi words MUST be in Devanagari. Romanized Marathi = CRITICAL FAIL.
- Code-switching: English tech terms OK, full English sentences = FAIL.
- Cultural authenticity: Must sound like a real Marathi creator, not translated English.
- Platform formality: LinkedIn = professional तुम्ही. Instagram = casual तू/रे.`,

  extractorGuard: `
MARATHI OUTPUT CONTEXT:
- The brief will generate Marathlish content.
- Preserve Marathi idioms, cultural references (Pune, Mumbai, Ganpati, cricket), Marathlish phrases.
- Keep JSON keys in English. Values can be in Marathlish.`,

  photoCaptionHint: `Natural Marathlish — write like Marathi creators post.
- Marathi words in Devanagari. English tech terms stay Latin.
- Instagram: casual, emojis OK, relatable tone. LinkedIn: professional Marathlish.
- Use Marathi cultural references naturally: वडापाव, Pune vibes, cricket.`,
};
