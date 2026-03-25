const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const claude = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

const SAMPLE = `I spent 6 months building an AI-powered content repurposing tool. Here's what I learned:
1. Most creators spend 3-4 hours reformatting one blog post for different platforms
2. AI can do it in 60 seconds with platform-specific instructions
3. Brand voice matters — generic AI output sounds robotic
4. Indian creators need Hinglish, not pure Hindi or pure English
5. WhatsApp Status and TikTok are massive in India but ignored by Western tools
The tool supports 9 platforms, 5 languages, free tier. Launching India first.`;

const HINDI_PROMPT = `आप Indian creators के लिए content repurposing में expert हैं।

GOAL: Natural Hinglish — exactly how Indians post on social media.

CRITICAL RULES:
1) CODE-SWITCHING — हर sentence में Devanagari Hindi + English mix।
   ✅ "Startup life में ये बहुत important है"
   ❌ "Startup life mein ye bahut important hai" (Romanized = BAD)
   ❌ "स्टार्टअप जीवन में यह अत्यंत महत्वपूर्ण है" (Shuddh Hindi = BAD)

2) ENGLISH (Latin script) ONLY for: startup, content, marketing, AI, tool, app, brand, growth, ROI, launch, audience, creator, platform, blog, post, video.

3) Hindi words MUST be DEVANAGARI:
   ✅ मैंने, सीखा, बहुत, लेकिन, ज़रूरी, करो, होता है, समझ आया, दोस्त, यार
   ❌ maine, seekha, bahut, lekin, zaroori (Romanized = NEVER)

4) TONE by platform:
   - LinkedIn: professional आप, warm. Instagram: casual तुम/यार. WhatsApp: SHORT 3-5 lines, NO hashtags. TikTok: spoken, punchy.

5) NEVER: Romanized Hindi | Shuddh news-Hindi | 100% English | Google Translate stiffness.`;

async function openaiGen(platform, instruction) {
  const t0 = Date.now();
  const r = await openai.chat.completions.create({
    model: "gpt-4o-mini", temperature: 0.82,
    messages: [
      { role: "system", content: "You are a specialist Indian social media content writer." },
      { role: "user", content: `${HINDI_PROMPT}\n\nPLATFORM: ${platform}\n${instruction}\n\nCONTENT:\n${SAMPLE}\n\nWrite in Hinglish (Devanagari + English). Plain text only.` }
    ]
  });
  return { text: r.choices[0].message.content, ms: Date.now() - t0 };
}

async function claudeSonnetGen(platform, instruction) {
  const t0 = Date.now();
  const r = await claude.messages.create({
    model: "claude-sonnet-4-5-20250929", max_tokens: 1500, temperature: 0.8,
    system: "You are a specialist Indian social media content writer. Follow formatting rules exactly.",
    messages: [
      { role: "user", content: `${HINDI_PROMPT}\n\nPLATFORM: ${platform}\n${instruction}\n\nCONTENT:\n${SAMPLE}\n\nWrite in Hinglish (Devanagari + English). Plain text only.` }
    ]
  });
  return { text: r.content[0].text, ms: Date.now() - t0 };
}

async function claudeHaikuGen(platform, instruction) {
  const t0 = Date.now();
  const r = await claude.messages.create({
    model: "claude-haiku-4-5-20251001", max_tokens: 1500, temperature: 0.8,
    system: "You are a specialist Indian social media content writer. Follow formatting rules exactly.",
    messages: [
      { role: "user", content: `${HINDI_PROMPT}\n\nPLATFORM: ${platform}\n${instruction}\n\nCONTENT:\n${SAMPLE}\n\nWrite in Hinglish (Devanagari + English). Plain text only.` }
    ]
  });
  return { text: r.content[0].text, ms: Date.now() - t0 };
}

function scoreDevanagari(text) {
  const hindiWords = text.match(/[\u0900-\u097F]+/g) || [];
  const romanHindi = text.match(/\b(mein|hai|karo|karte|karna|hain|nahi|aur|ke|ki|ka|ye|yeh|ho|tha|thi|bhi|se|par|lekin|kyunki|bahut|chahiye|kuch|jaise|woh|unhe|unka|hamara|tumhara|apna|sabse|pehle|baad|abhi)\b/gi) || [];
  return { devanagariCount: hindiWords.length, romanizedCount: romanHindi.length };
}

const TESTS = [
  ["LinkedIn", "Professional Hinglish (आप); 200-300 words; hook first 2 lines; 5-7 hashtags; end with question."],
  ["Instagram", "Casual Hinglish (तुम/यार); killer first line; 5-8 emojis; CTA; 8-15 hashtags."],
  ["WhatsApp Status", "MAX 3-5 lines. Under 80 words. NO hashtags. NO lists. Like texting a friend."],
  ["TikTok Script", "Spoken Hinglish; hook 2 seconds; MAX 7 short lines; [TEXT ON SCREEN] cues; verbal CTA. Under 150 words."],
];

(async () => {
  const totals = { oai: { dev: 0, rom: 0, ms: 0 }, sonnet: { dev: 0, rom: 0, ms: 0 }, haiku: { dev: 0, rom: 0, ms: 0 } };

  console.log("═".repeat(80));
  console.log("  GPT-4o-mini  vs  Claude Sonnet 4.5  vs  Claude Haiku 4.5");
  console.log("  HINDI / HINGLISH QUALITY HEAD-TO-HEAD");
  console.log("═".repeat(80));

  for (const [platform, inst] of TESTS) {
    console.log(`\n${"━".repeat(80)}`);
    console.log(`  ${platform.toUpperCase()}`);
    console.log("━".repeat(80));

    const [oai, sonnet, haiku] = await Promise.all([
      openaiGen(platform, inst),
      claudeSonnetGen(platform, inst),
      claudeHaikuGen(platform, inst),
    ]);

    const oaiS = scoreDevanagari(oai.text);
    const sonS = scoreDevanagari(sonnet.text);
    const haiS = scoreDevanagari(haiku.text);

    totals.oai.dev += oaiS.devanagariCount; totals.oai.rom += oaiS.romanizedCount; totals.oai.ms += oai.ms;
    totals.sonnet.dev += sonS.devanagariCount; totals.sonnet.rom += sonS.romanizedCount; totals.sonnet.ms += sonnet.ms;
    totals.haiku.dev += haiS.devanagariCount; totals.haiku.rom += haiS.romanizedCount; totals.haiku.ms += haiku.ms;

    console.log(`\n  🟢 GPT-4o-mini (${oai.ms}ms):`);
    console.log("  " + "─".repeat(50));
    console.log(oai.text.split("\n").map(l => "  " + l).join("\n"));
    console.log(`  📊 Devanagari: ${oaiS.devanagariCount} | Romanized: ${oaiS.romanizedCount} | Words: ${oai.text.split(/\s+/).length}`);

    console.log(`\n  🟣 Claude Sonnet 4.5 (${sonnet.ms}ms):`);
    console.log("  " + "─".repeat(50));
    console.log(sonnet.text.split("\n").map(l => "  " + l).join("\n"));
    console.log(`  📊 Devanagari: ${sonS.devanagariCount} | Romanized: ${sonS.romanizedCount} | Words: ${sonnet.text.split(/\s+/).length}`);

    console.log(`\n  🔵 Claude Haiku 4.5 (${haiku.ms}ms):`);
    console.log("  " + "─".repeat(50));
    console.log(haiku.text.split("\n").map(l => "  " + l).join("\n"));
    console.log(`  📊 Devanagari: ${haiS.devanagariCount} | Romanized: ${haiS.romanizedCount} | Words: ${haiku.text.split(/\s+/).length}`);
  }

  console.log(`\n${"═".repeat(80)}`);
  console.log("  FINAL SCORECARD (across all 4 platforms)");
  console.log("═".repeat(80));
  console.log(`\n  Model              | Devanagari | Romanized | Ratio (higher=better) | Total ms`);
  console.log("  " + "─".repeat(76));

  for (const [name, d] of [["GPT-4o-mini      ", totals.oai], ["Claude Sonnet 4.5", totals.sonnet], ["Claude Haiku 4.5 ", totals.haiku]]) {
    const ratio = d.rom === 0 ? "∞" : (d.dev / d.rom).toFixed(1);
    console.log(`  ${name} | ${String(d.dev).padStart(10)} | ${String(d.rom).padStart(9)} | ${String(ratio).padStart(21)} | ${d.ms}ms`);
  }
  console.log();
})();
