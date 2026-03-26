const Anthropic = require("@anthropic-ai/sdk");

const claude = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

const SAMPLE = `I spent 6 months building an AI-powered content repurposing tool. Here's what I learned:
1. Most creators spend 3-4 hours reformatting one blog post for different platforms
2. AI can do it in 60 seconds with platform-specific instructions
3. Brand voice matters — generic AI output sounds robotic
4. Indian creators need Hinglish, not pure Hindi or pure English
5. WhatsApp Status and TikTok are massive in India but ignored by Western tools
The tool supports 9 platforms, 5 languages, free tier. Launching India first.`;

const HINDI_LANG_FOOTER = `LANGUAGE — HINGLISH (Indian social):
CRITICAL: Hindi words MUST be in Devanagari script (मैंने, सीखा, बहुत, लेकिन, ज़रूरी). NEVER write Hindi in Roman script (maine, seekha, bahut, lekin). English tech/platform terms stay in Latin script (startup, content, AI, brand, growth, LinkedIn).
Mix Devanagari Hindi (~60%) with English (~40%). Sound like real Indian creators posting on social — NOT textbook Hindi, NOT Google Translate, NOT 100% English.
Tone: LinkedIn/email → आप + warm professional. Instagram/Facebook → casual तुम/यार where natural. X → punchy mix. Reddit → helpful, no marketing voice, usually no emojis. WhatsApp → SHORT (3-5 lines max), no hashtags.
Hashtags: mix Hindi + English discoverable tags when the format uses hashtags (NOT on WhatsApp).`;

const PLATFORMS = {
  linkedin: {
    prompt: `You are the world's best LinkedIn content writer.

CONTENT BRIEF:
Core message: AI content repurposing tool saves creators hours
Key points: 3-4 hours manual work | AI does it in 60s | Brand voice matters | Hinglish needed | WhatsApp/TikTok ignored by West
Audience: Indian creators & marketers
Original tone: conversational

YOUR TASK: Write one LinkedIn post that will perform exceptionally well.
LINKEDIN RULES:
1. Hook in first 2 lines — must make reader click "see more"
2. Short paragraphs — max 2-3 lines each, one blank line between
3. End with a question that invites conversation
4. 3-5 hashtags at the end
5. Length: 150-300 words

${HINDI_LANG_FOOTER}

HINDI + LINKEDIN:
- Length ~250–400 words (stay under 3000 chars).
- Hook in Hinglish in first 2 lines; आप.
- Short paragraphs; 2–3 emojis max; 5–7 mixed hashtags; end with a real question for comments.

Respond with ONLY the LinkedIn post text.`,
  },
  instagram: {
    prompt: `You are the world's best Instagram caption writer.

CONTENT BRIEF:
Core message: AI content repurposing tool saves creators hours
Key points: 3-4 hours manual work | AI does it in 60s | Brand voice matters | Hinglish needed | WhatsApp/TikTok ignored by West
Audience: Indian creators & marketers
Original tone: conversational

YOUR TASK: Write an Instagram caption that drives saves and comments.
RULES:
1. First line: pattern interrupt, make viewer tap "more"
2. Short paragraphs, emojis as visual bullets
3. CTA: ONE clear call to action
4. HASHTAGS: 8-15 at the end
5. Length: 100-300 words total

${HINDI_LANG_FOOTER}

HINDI + INSTAGRAM:
- Killer first line (<125 chars visible before "more").
- Short paras, line breaks; 5–8 emojis integrated.
- CTA (comment / save / share); 8–15 hashtags after a blank line.
- Casual तुम/यार tone.

Respond with ONLY the caption text (including hashtags).`,
  },
  whatsapp_status: {
    prompt: `You are an expert at crafting punchy WhatsApp Status updates.

CONTENT BRIEF:
Core message: AI content repurposing tool saves creators hours
Key points: 3-4 hours manual work | AI does it in 60s | Brand voice matters | Hinglish needed
Audience: Indian creators & marketers

YOUR TASK: Write a WhatsApp Status update (text-based).
CRITICAL RULES:
1. MAXIMUM 3-5 lines. Under 80 words.
2. ONE punchy statement to open.
3. Pick THE single most interesting takeaway.
4. Write like texting a friend. No bullet points. No numbered lists.
5. Max 2-3 emojis.
6. ABSOLUTELY NO hashtags.
7. Think: what would make someone screenshot this?

${HINDI_LANG_FOOTER}

HINDI + WHATSAPP STATUS:
- 50–100 words max; urgent/friendly; 3–5 emojis; one clear CTA or timebound line.
- SHORT. NO hashtags. Like texting a दोस्त.

Write ONLY the status text.`,
  },
  tiktok: {
    prompt: `You are a viral TikTok script writer.

CONTENT BRIEF:
Core message: AI content repurposing tool saves creators hours
Key points: 3-4 hours manual work | AI does it in 60s | Brand voice matters | Hinglish needed | WhatsApp/TikTok ignored by West
Audience: Indian creators & marketers

YOUR TASK: Write a TikTok video script (talking-head style).
CRITICAL RULES:
1. HOOK first 2 lines — pattern interrupt.
2. BODY: MAX 5-7 short sentences. One idea per line.
3. Use [TEXT ON SCREEN: ...] for 2-3 visual overlays.
4. Write for the EAR, not the eye.
5. End with ONE verbal CTA.
6. NO hashtags. NO numbered lists. NO bullet points.
7. Keep under 150 words total.

${HINDI_LANG_FOOTER}

HINDI + TIKTOK SCRIPT:
- Spoken Hinglish; hook in first 2 seconds; short lines; [bracket] visual cues; end with verbal CTA.

Write ONLY the script. No JSON. No title.`,
  },
};

function score(text) {
  const dev = (text.match(/[\u0900-\u097F]+/g) || []).length;
  const rom = (text.match(/\b(mein|hai|karo|karte|karna|hain|nahi|aur|ke|ki|ka|ye|yeh|ho|tha|thi|bhi|se|par|lekin|kyunki|bahut|chahiye|kuch|jaise|woh|unhe|unka|hamara|tumhara|apna|sabse|pehle|baad|abhi|maine|seekha|zaroori|isliye|toh|ek|pata|chala)\b/gi) || []).length;
  const words = text.split(/\s+/).length;
  return { dev, rom, words };
}

(async () => {
  console.log("═".repeat(75));
  console.log("  CLAUDE HAIKU 4.5 — HINDI PRODUCTION QUALITY TEST");
  console.log("═".repeat(75));

  for (const [name, cfg] of Object.entries(PLATFORMS)) {
    console.log(`\n${"━".repeat(75)}`);
    console.log(`  ${name.toUpperCase()}`);
    console.log("━".repeat(75));

    const t0 = Date.now();
    const r = await claude.messages.create({
      model: MODEL, max_tokens: 2048, temperature: 0.8,
      system: "You are a specialist social media content writer. Follow all instructions exactly. Respect all character limits strictly.",
      messages: [{ role: "user", content: cfg.prompt }],
    });
    const text = r.content[0].text;
    const ms = Date.now() - t0;
    const s = score(text);

    console.log(`\n  (${ms}ms)`);
    console.log("  " + "─".repeat(50));
    console.log(text.split("\n").map(l => "  " + l).join("\n"));
    console.log(`\n  📊 Devanagari: ${s.dev} | Romanized: ${s.rom} | Words: ${s.words}`);

    const checks = [];
    if (s.rom === 0) checks.push("✅ Zero Romanized Hindi");
    else checks.push(`⚠️  ${s.rom} Romanized Hindi words detected`);
    if (s.dev >= 10) checks.push(`✅ Good Devanagari count (${s.dev})`);
    else checks.push(`⚠️  Low Devanagari count (${s.dev})`);
    if (name === "whatsapp_status" && s.words <= 100) checks.push("✅ WhatsApp length OK");
    else if (name === "whatsapp_status") checks.push(`⚠️  WhatsApp too long (${s.words} words)`);
    if (name === "whatsapp_status" && !text.includes("#")) checks.push("✅ No hashtags on WhatsApp");
    else if (name === "whatsapp_status" && text.includes("#")) checks.push("⚠️  Hashtags found on WhatsApp");
    if (name === "tiktok" && text.includes("[TEXT ON SCREEN")) checks.push("✅ TikTok has screen cues");
    else if (name === "tiktok") checks.push("⚠️  TikTok missing screen cues");
    console.log(`  ${checks.join(" | ")}`);
  }

  console.log(`\n${"═".repeat(75)}`);
})();
