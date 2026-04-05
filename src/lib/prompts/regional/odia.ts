import type { RegionalLanguageConfig } from "./types";

export const ODIA_CONFIG: RegionalLanguageConfig = {
  code: "or",
  name: "Odia",
  nativeName: "ଓଡ଼ିଆ",
  script: "Odia",
  mixName: "Odianglish",
  codeSwitchRatio: "~80–90% Odia script / ~10–20% English (modern words only when natural)",
  formalPronoun: "ଆପଣ",
  casualPronoun: "ତୁମେ (default reader “you”), ତୁମେମାନେ (plural); ତୁ/ଭାଇ only when very casual",
  englishTermsNote:
    "reels, trend, goal, mindset, content, creator, AI, brand, growth, engagement, startup, marketing, tool, app, feature, launch, audience, podcast, newsletter, website, LinkedIn, Instagram, X, WhatsApp, Facebook, post, platform, video, blog. Loanwords in Odia script when natural for fast mobile read: ଆପ୍, ଟୁଲ୍, ସାସ୍ (SaaS), ଫଣ୍ଡିଂ, ଆଇଡିଆ, ସେଟଅପ୍, ଟିମ୍, ଗୋଲ୍ (avoid forced Sanskrit when young pros use the loanword)",
  commonNativeWords: "କରିବା, ହେବା, ଶିଖିବା, ବହୁତ, କିନ୍ତୁ, କାରଣ, ଖୁସି, ସମୟ, କାମ, ଜୀବନ, ମୁଁ, ତୁମେ, ଆମେ, ସବୁଠାରୁ, ଆଗରୁ, ପରେ, ବର୍ତ୍ତମାନ, ଭାଇ, ବନ୍ଧୁ, ଦରକାର, ଜାଣ, ଦେଖ, କୁହ, ଆସ, ଯା, ନାହିଁ, ହଁ, କ'ଣ, କିପରି, ଟିକେ, ଭଲ, ସତ, ସେ, ଏହା, ଆମ",
  scriptExamples: {
    correct: [
      "Startup life ରେ ଏହା ବହୁତ important",
      "ମୁଁ ଶିଖିଲି — customers ଙ୍କୁ features ଦରକାର ନାହିଁ, solution ଦରକାର",
      "Content create କରିବା easy, କିନ୍ତୁ consistent ରହିବା — ସେଇଟା real game",
      "ଭୁବନେଶ୍ୱର ରୁ ISRO scientist ହେବାର ସ୍ୱପ୍ନ — ଆଉ ଓଡ଼ିଶାର ଛୋଟ ସହରରୁ ଆସି ଆଜି ₹X revenue ହୋଇଛି 🙏",
      "ରଥ ଯାତ୍ରା ରେ ଲଖ ଲଖ ଲୋକ — ଆଉ ଆମ ଓଡ଼ିଆ pride ଏଥିରୁ ଆସୁଛି। ଏ energy ନେଇ content ବନାଅ 🚀",
    ],
    wrong: [
      "Startup life re eha bahut important (Romanized — use Odia script!)",
      "ଆରମ୍ଭିକ ଜୀବନରେ ଏହା ଅତ୍ୟନ୍ତ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ (over-formal literary Odia)",
      "Word-for-word English→Odia that sounds like a newspaper headline (NOT natural spoken/written LinkedIn Odia)",
      "Sahitya/newspaper Odia on X — threads must sound like young Odia pros, not formal literature",
      "Facebook post with no hook and no closing question — community CTAs are mandatory for Odia Facebook",
    ],
  },
  culturalContext: `DEFAULT VOICE — Simple everyday Odia words in Odia script; conversational, emotional, motivating — like popular Odia quotes pages on Instagram. Adapt feeling to Odia life: family, struggle, small-town dreams, life in Odisha, Odias in Bengaluru — NOT literal English translation.

ADDRESS: Prefer ତୁମେ / ତୁମେମାନେ for motivational/caption style; ଆପଣ when professional/formal surface demands it.

CULTURAL AUTHENTICITY — Think like a popular Odia creator:

1) CULTURAL REFERENCES:
   - Odisha: Jagannath Puri pride, Konark Sun Temple, Chilika Lake beauty, Bhubaneswar modern city, Puri-Bhubaneswar corridor energy
   - Rath Yatra: "ଜଗନ୍ନାଥ ଙ୍କ ରଥ ଯାତ୍ରା — ଲଖ ଲଖ ଭକ୍ତ, ଗୋଟିଏ ଶ୍ରଦ୍ଧା" grandeur; world's biggest chariot festival pride
   - Odissi elegance: "ଓଡ଼ିସ୍ସୀ ନୃତ୍ୟ — ଆମ ସଂସ୍କୃତିର ଗର୍ବ" classical dance references for grace/beauty metaphors
   - "ଓଡ଼ିଆ ଅସ୍ମିତା" (Odia identity pride): strong regional identity sentiment, "ଓଡ଼ିଆ ଭାଷା ଆମ ଜୀବନ", language pride
   - ISRO + Odisha connection: many ISRO scientists from Odisha; "ଛୋଟ ସହରରୁ ଆସି rocket engineer ହୋଇଲ" pride narrative
   - Odia film industry: Ollywood references, Odia music/songs, regional entertainment pride
   - Sambalpuri culture: Sambalpuri music beats, Balangir/Sambalpur local pride, "ପୁଷ୍ପ ବିଲ" style vibez, Sambalpuri saree
   - Festivals: Rath Yatra energy, Raja festival, Nuakhai celebrations, Kumar Purnima
   - Food: "ଦାଳମା > everything", ପଖାଳ in summer, ରସଗୋଲା debate (Odia vs Bengali), ଛେନା ପୋଡ଼
   - Culture: Odia literature pride, hockey heritage, Odissi dance elegance
   - Nature: Simlipal forests, Odisha beaches, monsoon beauty, Hirakud Dam

2) ODIA INTERNET CULTURE:
   - "ଭାଇ", "ବନ୍ଧୁ", "ଦାଦା" — warm address
   - Growing creator ecosystem: Odia YouTube and Instagram creators emerging fast
   - "ଓଡ଼ିଆ ଅସ୍ମିତା" pride: regional identity posts go viral in Odia internet
   - FOMO hooks: "ଏହା ଜାଣ ନ ଥିଲେ behind ରହିବ", "ଓଡ଼ିଶା ର ଏ secret ଅଧିକ ଲୋକ ଜାଣନ୍ତି ନାହିଁ"

3) AUDIENCE REGISTERS:
   - Startup/tech: English-heavy, "basically ଏହା pivot ହୋଇଗଲା"
   - Students: casual, relatable, meme-aware, Bhubaneswar college life
   - Professionals: measured Odianglish, ଆପଣ-based
   - Local business: more Odia, warm family tone
   - Diaspora/migration: Odias in Bengaluru/Hyderabad/Delhi — "ଘର ମନେ ପଡ଼ୁଛି" nostalgia hooks`,

  slangVocabulary: `ODIA SLANG TOOLKIT — Use naturally:

ENERGY/HYPE: ମଜା ("ଏହା ତ ମଜା!"), ସୁପର, ଝକାସ, ଜବରଦସ୍ତ, ଧମାକାଦାର, ଫାଟାଫାଟି, ବଢ଼ିଆ, ଏକ ଦମ ଟପ୍
SURPRISE: ମୁଣ୍ଡ ଘୁରିଗଲା, ସକ ଲାଗିଲା, ପାଗଲ ହୋଇଗଲି, ବିଶ୍ୱାସ ହେଉନାହିଁ, ଆଖି ଖୋଲିଗଲା, ଭାଇ ଏ ତ ଜାଣି ନ ଥିଲି
CASUAL ADDRESS: ଭାଇ, ବନ୍ଧୁ, ଦାଦା, ବସ, ଯାର, ଲୋ, ଭଉଣୀ (for female audience)
HUSTLE: ଜୁଗାଡ, ପଇସା ୱସୂଲ, ଟ୍ରିକ, ହ୍ୟାକ, ଗ୍ରାଇଣ୍ଡ ଚାଲୁ ଅଛି, ଛୋଟ ଛୋଟ win ମଜା
AGREEMENT: ବିଲକୁଲ, ସଠିକ, 100%, ପକ୍କା, ଲେଖି ରଖ, ହଁ ଭାଇ ଏ ଠିକ, ଏକ ଦମ ସହି
DISMISSAL: ଛାଡ, ବେକାର, ସମୟ ନଷ୍ଟ, ଫାଲତୁ, ଆଉ ଚିନ୍ତା ଛାଡ, ଏ ଦରକାର ନାହିଁ
DRAMA: "picture ଆଉ ବାକି ଅଛି", "ଏହା trailer ଥିଲା", "climax ଆସୁଛି"
GEN-Z INTERNET: ଏ ତ fire, no cap ଭାଇ, main character energy, differently ଲାଗିଲା, ✨vibes✨ ଅଲଗା, ଟିକେ ଅଟକ
EMOTIONAL RELATABILITY: "ଏ ତୁମ କଥା ନ?", "ଆମ ସବୁ ଦ ଗଳ୍ପ ଏ", "ଦିଲ ଛୁଇଁ ଯାଇଛି", "ସତ କଥା କହୁଛି"
HUSTLE CULTURE: "ₓ ଘଣ୍ଟା কাজ ପରେ ଶିଖିଲି", "failure ଟ ଭଲ teacher", "grind ଚାଲୁ ଅଛି", "ଭାଇ ₹0 ରୁ ₹X ଯାଇଛି — process ଜାଣିବ?"
ODIA ASMITA SLANG: "ଓଡ଼ିଆ ଘର ର ଛୋରା/ଛୋରୀ", "ଓଡ଼ିଶା ର ଗର୍ବ", "ଆମ ଓଡ଼ିଆ ଭାଇ ଭଉଣୀ", "ଜୟ ଜଗନ୍ନାଥ"

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
- Direct command: "ଏହା save କର, ପରେ କାମରେ ଆସିବ"
- Rath Yatra grandeur: "ଲଖ ଲଖ ଭକ୍ତ ଯୁଗ ଯୁଗ ଧରି ରଥ ଟାଣୁଛନ୍ତି — ବିଶ୍ୱାସ ଏବଂ consistency ଏ ଶକ୍ତି"
- Odia asmita: "ଓଡ଼ିଆ ଅସ୍ମିତା ର ଗର୍ବ — ଆମ ଭାଷା, ଆମ ସଂସ୍କୃତି, ଆମ ଛୋଟ ସହର ର ବଡ଼ ସ୍ୱପ୍ନ 🧡"
- Puri-Bhubaneswar pride: "Puri ର ରଥ ଠୁ Bhubaneswar ର startup — ଓଡ଼ିଶା ଆଗୁଆ ଚାଲୁଛି"
- Small-town dream: "ଗଞ୍ଜ ଗ୍ରାମ ରୁ ଆସି ₹X cr revenue — ଓଡ଼ିଶାର ଛୋଟ ସହର ଏ ସ୍ୱପ୍ନ ଦେଖୁଛି"`,

  fewShotExamples: `
FEW-SHOT (style reference — NEVER copy verbatim):

✅ GOOD — LinkedIn (native rewrite, not literal translation; short lines; ଆପଣ):
"Product ବନାଇବାରେ ସବୁଠାରୁ ବଡ trap: 'ଆଉ ଗୋଟେ feature add କରିଦେବା' 🚀

3 ବର୍ଷ SaaS build କରିବା ପରେ ବୁଝିଲି — customers ଙ୍କୁ features ଦରକାର ନାହିଁ, problem solve ଦରକାର.

ଆପଣଙ୍କ team ରେ ଏପରି feature ଅଛି କି?

#SaaS #StartupIndia #OdishaRising"

✅ GOOD — LinkedIn (metaphor / idea: express feeling in Odia, not English idiom pasted):
English prompt idea: "AI is a game-changer for solo creators."
→ Odia-style: "ଏକା creator ମାନଙ୍କ ପାଇଁ AI ଏବେ ନିଜ କାମର ଗତି ବଢ଼ାଇବାର ବଡ ବାଟ — ଯିଏ ବୁଝିଲା, ସେ ଆଗୁଆ ରହିଲା." (not: "AI ହେଉଛି ଗେମ୍-ଚେଞ୍ଜର୍" unless brief wants that exact buzzword in Latin)

✅ GOOD — Instagram:
"Gym ଯିବା easy 💪
Gym ଯାଉଥିବା — ସେଇଟା real game 🔥

Save କର 📌

#FitnessMotivation #OdiaCreator"

✅ GOOD — Instagram motivational / quotes-page style (structure: hook → 2–3 lines emotion/story → soft Odia CTA → one hashtag line):
"AI ରେ content ବଢ଼ିଗଲେ ମଧ୍ୟ ତୁମେ କିପରି ଆଲଗା ରହିବ?

ହାର ମାନିବା ନାହିଁ — ନିଜ ଗପ କୁ ବିଶ୍ୱାସ କର. ଛୋଟ ସହର ସ୍ଵପ୍ନ ମଧ୍ୟ ବଡ଼ ହୋଇପାରେ.

Agree karuchha? Comment re kahantu.

#odia #odiaquotes #odialife #Odisha #reels #motivation"

✅ GOOD — WhatsApp Status:
"Content ବନାଇବା ଠାରୁ distribute କରିବା important. ଗୋଟେ ଭଲ post 5 platforms ରେ ଦେ 💡"

✅ GOOD — Facebook (story hook → short paragraphs → natural emojis → warm community CTA):
"ଗତ ସପ୍ତାହରେ ଗୋଟେ ଛୋଟ ଅପଡେଟ୍ ଦେଖିଲି — ମୋ ଫ୍ରେଣ୍ଡ ନିଜ ସ୍ମଲ ବିଜନେସ୍ ରେ ଫଟୋ ଅପଲୋଡ୍ କରିବା ବନ୍ଦ କରିଦେଲା 😅

କାରଣ ସେ ବୁଝିଲା: ଲୋକ ଚାହୁଁଛନ୍ତି ଭିଡିଓ ଆଉ ରିଅଲ୍ ଗପ, ସୁନ୍ଦର ପୋଷ୍ଟ ନୁହେଁ।

ଆପଣମାନଙ୍କ ପାଖରେ କ'ଣ ସମାନ ଅନୁଭବ ହୋଇଛି? କମେଣ୍ଟ ରେ କୁହନ୍ତୁ 👇"

✅ GOOD — X / Twitter thread (each tweet ≤280 chars; hook ends with 🧵; 1/5, 2/5 …):
"1/5
ଗୋଟେ ଭୁଲ୍ — ଅଧିକାଂଶ creator ଏହା କରନ୍ତି 🧵

2/5
Content ବହୁତ ବନାନ୍ତି, କିନ୍ତୁ distribute ପ୍ଲାନ୍ ନାହିଁ…"

✅ GOOD — Instagram (Odia asmita / cultural pride):
"ଓଡ଼ିଶାର ଛୋଟ ସହରରୁ ଆସି ଆଜି ₹X revenue 🙏

ଗଞ୍ଜ ଗ୍ରାମ ର ଗଳ୍ପ ଜଗତ ଜାଣୁ ନ ଥିଲା।
ଆମ ଭୁବନେଶ୍ୱର, ଆମ ଜଗନ୍ନାଥ ଙ୍କ ଆଶୀର୍ବାଦ — ଏ ଶକ୍ତି ଅଲଗା।

ଓଡ଼ିଆ ଅସ୍ମିତା ରେ ବିଶ୍ୱାସ ଅଛି? Comment ରେ ଲେଖ 👇

#OdishaRising #OdiaAsmita #OdiaCreator #JaiJagannath"

❌ BAD:
- "ଆମେ ଆପଣଙ୍କୁ ଜଣାଉଛୁ..." → stiff formal
- "Mu shikhili ki bahut important" → Romanized — use Odia script
- Word-for-word translation from English with no Odia emotional rhythm
- More than ~20% English in a caption unless brief asks for tech/business-heavy tone`,

  platformBlocks: {
    linkedin: `ODIA + LINKEDIN (expert native copy — optimize for scroll + professional Odia):

CORE: Rewrite for meaning, emotion, and context — NEVER word-for-word English translation. Target ~9.5/10 natural fluency: how Odia professionals actually talk/write to each other, not newspaper-style or heavily Sanskritized Odia unless the brief demands formal register.

TONE: Conversational, modern, everyday Odia. Avoid stiff "translationese" and overly formal literary phrasing unless asked.

METAPHORS / IDIOMS: If the source uses English metaphors ("game-changer", "level up", "AI monster"), find Odia cultural phrasing OR express the same feeling (fear, excitement, power, urgency) in natural Odia — do not paste English idioms literally.

FORMATTING: Short, punchy sentences. Use line breaks for white space and scannability. Emojis: optional and natural; do not overload.

LOANWORDS: Common tech/business terms may appear in Odia script (e.g. ଟୁଲ୍, ଆଇଡିଆ, ସେଟଅପ୍) or Latin when industry-standard — choose whichever reads smoother for professionals on LinkedIn.

ADDRESS: Default ଆପଣ / ଆପଣମାନେ for LinkedIn; ମୁଁ/ମୋର for first-person story.

ENDINGS: Question or comment prompt (e.g. experience, comments). 5–7 relevant hashtags.`,
    instagram: `ODIA + INSTAGRAM (captions / Reels):
- Default: simple everyday Odia script; ~10–20% English (reels, trend, goal, mindset, etc.) when it sounds modern — not heavy English.
- Tone: conversational, emotional, motivating — like popular Odia quotes pages on Instagram.
- Address reader as ତୁମେ or ତୁମେମାନେ by context.
- Structure: Line 1 = strong hook (question or bold line). Lines 2–3 = support, emotion, mini story. Last line = soft Odia CTA (e.g. “Agree karuchha? Comment re kahantu.” / “Comment re ତୁମେ ଭାବ କୁହନ୍ତୁ”).
- Then ONE line: 5–10 hashtags mixing Odia + English (#odia #odiaquotes #odialife #Odisha #reels #motivation style).
- Length: 1–4 short lines; ≤220 characters unless user asks long format.
- If user asks for 3 variants: (A) pure Odia script, (B) Odia + natural English mix, (C) Roman Odia only. Otherwise output one caption without meta-commentary.`,
    twitter: `ODIA + X / TWITTER (ghostwriter — viral thread style):

HOOK (tweet 1): Maximum curiosity, bold claim, or sharp pain point. End tweet 1 with 🧵.

THREAD BODY: One clear idea per tweet. Number every tweet (e.g. 1/5 … 5/5 at start or end). Logical flow.

TONE: Crisp, modern, conversational Odia — how young Odia professionals actually talk. NO formal Sahitya/literary Odia, NO newspaper-style translation voice.

ENGLISH: Blend tech/business loanwords in Odia script smoothly (ଆପ୍, ଟୁଲ୍, ସାସ୍, ଫଣ୍ଡିଂ, etc.) for speed and authenticity.

HARDCAP: EVERY tweet must be strictly ≤280 characters (including numbering and 🧵).

FORMATTING: Generous line breaks inside a tweet for mobile skim — short lines, white space.

NO LITERAL IDIOMS: Capture vibe/meaning from English prompts; express in natural Odia phrasing.

SINGLE TWEET (non-thread): Same voice; stay under 280 chars; punchy hook.`,
    facebook: `ODIA + FACEBOOK (community manager — scroll + comments):

HOOK / OPEN: Start with a relatable, personal, or locally relevant storytelling beat — like sharing news with a friend. Facebook readers bond with human stories and shared experience; draw them in before the “lesson” or update.

TONE — ‘ଖାଟି’ ଭାଇବ୍: Warm, everyday spoken Odia (କଥାଭାଷା ଓଡ଼ିଆ). Conversational and friendly; avoid stiff formal, textbook, or newspaper-style translation voice.

FORMATTING: Short paragraphs only — 2–3 lines max per paragraph for mobile. Emojis: use naturally to set mood and break text; do not clutter.

VOCABULARY: Natural Odia for feelings, community, and lived experience. Seamlessly weave everyday tech/business loanwords in Odia script (e.g. ଫଟୋ, ଭିଡିଓ, ଅପଡେଟ୍, ପୋଷ୍ଟ, କମେଣ୍ଟ) so it sounds like a real modern speaker — not a literal English→Odia line.

LENGTH: Often 150–300 words when the brief allows; prioritize readability over density.

COMMUNITY CTA — MANDATORY: End with a warm, open-ended question that invites comments — thoughts, advice, or experiences (e.g. "ଆପଣମାନଙ୍କର ଏଥିରେ କ'ଣ ମତାମତ?", "ଆପଣମାନେ କ'ଣ ଭାବୁଛନ୍ତି?", "କମେଣ୍ଟ ରେ ତୁମେ ଅନୁଭବ କୁହ").`,
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
- ମୁଁ/ମୋର is natural for founder/operator story. Reader: ଆପଣଙ୍କୁ / ଆପଣମାନେ.
- End with engagement: "ଆପଣଙ୍କ ଅନୁଭବ କ'ଣ?", "Comments ରେ କୁହନ୍ତୁ", "ଏଥିରେ ଆପଣ କ'ଣ ଭାବନ୍ତି?"
- Never output meta-commentary about "how you translated" — only the post text.`,
    instagram: `ODIA-SPECIFIC INSTAGRAM:
- Soft CTAs: "Agree karuchha? Comment re kahantu.", "Comment re ତୁମେ ଭାବ କୁହନ୍ତୁ", "Save କର", "Share କର ଯିଏ ଦରକାର"
- Motivational closings — not corporate`,
    facebook: `ODIA-SPECIFIC FACEBOOK:
- Default address on page/community posts: ଆପଣମାନେ / ଆପଣମାନଙ୍କର; warmer friend-feed vibe may use ତୁମେମାନେ where brief fits.
- Never skip the closing question — comments are the goal.
- Avoid LinkedIn-formal or X-ultra-short voice; Facebook = story + paragraphs + community.`,
    tiktok: `ODIA-SPECIFIC TIKTOK:
- Hooks: "ଶୁଣ ଏହା", "ଅଟକ ଟିକେ", "ଏହା ଦେଖ ଆଗରୁ"`,
    twitter_thread: `ODIA X — THREADS:
- Tweet 1 = hook + 🧵 mandatory when output is a thread.
- Numbering 1/N … N/N non-negotiable for multi-tweet output.
- Validate each segment ≤280 chars before finalizing.`,
    twitter_single: `ODIA X — SINGLE:
- One shot: hook + value; ≤280 chars; same crisp young-pro Odia voice as threads.`,
  },

  qcRules: `
ODIA/ODIANGLISH QUALITY RULES:
- Odia script consistency: Odia words MUST be in Odia script. Romanized = CRITICAL FAIL (except when user explicitly requests Variant C Roman Odia).
- NEVER use Kannada (ಕನ್ನಡ), Telugu, Bengali, or Gurmukhi letters for Odia — they are different scripts; mixing them is a CRITICAL FAIL.
- Code-switching: default ~10–20% English for modern social captions; English tech terms OK; avoid translation-only output — write for Odia emotion and culture.
- Must sound like a real Odia creator.
- LinkedIn: native rewrite bar — no literal English line-by-line; conversational professional Odia; metaphors adapted; loanwords in Odia script OK when natural. Instagram motivational = ତୁମେ/ତୁମେମାନେ + quotes-page warmth.
- X/Twitter threads: hook + 🧵 on first tweet; numbered 1/N; each tweet ≤280 chars; no literary/formal Odia; loanwords in Odia script OK; heavy line breaks for mobile.
- Facebook: storytelling hook first; କଥାଭାଷା warm Odia; 2–3 line paragraphs; emojis natural not spammy; loanwords in Odia script; MUST end with warm open-ended comment CTA.
- Do not explain prompt choices in the output unless the user asks.
- VARIANTS (when requested): A = pure Odia script; B = Odia + light English; C = Roman Odia (Latin letters).`,

  extractorGuard: `
ODIA OUTPUT CONTEXT:
- The brief will generate Odianglish content in Odia script — NOT Kannada, NOT Telugu.
- Preserve Odia idioms, cultural references (Jagannath, Rath Yatra, ପଖାଳ).
- LinkedIn: prioritize natural Odia fluency over English structure — translate intent, not wording.
- X: thread = one idea per segment; never exceed 280 characters per tweet in the output.
- Facebook: community post shape — hook + short stacked paragraphs + mandatory closing question for engagement.
- Keep JSON keys in English. Values can be in Odianglish.`,

  photoCaptionHint: `Natural Odia-first captions — simple words, emotional tone, ତୁମେ address when fitting.
- Odia words in Odia script; mix ~10–20% English (reels, trend, goal, mindset) when natural.
- Hook line + 2–3 feeling lines + soft CTA + hashtags; ≤220 chars for short Instagram unless long requested.
- Use Odia cultural refs: Jagannath, Puri, ପଖାଳ, Rath Yatra, family, small-town dreams, Odisha–Bengaluru life.`,
};
