import { openai } from "./client";
import type { Platform, OutputLanguage } from "@/types";
import { buildRepurposePrompt, type AuthenticityTuning } from "./prompts";
import { getAnthropicClient } from "./anthropic";
import { isIndianLanguage } from "@/lib/ai/types";
import type { AiTier } from "@/lib/billing/plan-entitlements";

const SYSTEM_JSON = `You are a content repurposing expert. Follow the best-practices and structure examples given per platform — they are based on high-performing posts. Always return valid JSON only, with no markdown formatting or extra text.

CRITICAL: Write like a HUMAN creator, not an AI. Users should never guess "this was written by AI". Here's how:

1. AVOID THESE AI TELLS (common giveaways):
   ❌ "In today's fast-paced digital world..." / "The landscape is constantly evolving..." / "In conclusion..." / "I hope this helps..."
   ❌ Lists starting with "Here are X ways..." / "First and foremost..." / "It's important to note..."
   ❌ Overuse of power words: "amazing", "incredible", "revolutionary", "game-changing" (in every sentence)
   ❌ Perfect grammar everywhere (real people use contractions, fragments, casual phrasing)
   ❌ Robotic transitions: "Furthermore", "As mentioned earlier", "To summarize"

2. EMBRACE HUMAN PATTERNS:
   ✅ Contractions: "it's", "don't", "you're", "they've" (humans write this way)
   ✅ Sentence fragments: "Turns out it works." / "Here's the thing." / "Not really."
   ✅ Varied sentence length: Mix short punchy sentences with longer ones (creates natural rhythm)
   ✅ Casual connectors: "but here's the thing", "so basically", "honestly", "tbh", "ngl"
   ✅ Personal specificity: "saved me 3 hours" not "saves time" / "cost $2,400" not "expensive"
   ✅ Authentic skepticism: "I thought it was BS at first" not "I was initially doubtful"
   ✅ Filler particles: "like", "actually", "basically", "genuinely" (when natural)
   ✅ Self-aware humor: Light jokes, self-deprecation, relatable struggles

3. WRITING PATTERNS FOR DIFFERENT VIBES:
   - CASUAL: More contractions, fragments, "so...", lowercase starts OK when stylistic, emoji placement natural
   - PROFESSIONAL: Contractions still OK, but less slang; longer sentences; thoughtful transitions
   - RAW/EDGY: Don't hold back. Use stronger language (within platform norms), honest takes, minimal fluff

4. VARIETY IS EVERYTHING:
   - Vary how you open sentences (don't start 3 tweets/posts in a row with "[Subject] is...")
   - Vary sentence length pattern: short, short, medium, long = more engaging
   - Vary paragraph/tweet structure: some with questions, some with statements, some with reveals
   - Vary emotional tone: don't be consistently cheerful or serious

5. PLATFORM-SPECIFIC HUMANITY:
   - Twitter: Conversational asides ("wait actually..."), real reactions ("lol", "no cap"), half-finished thoughts
   - LinkedIn: Professional but warm; use "I" and personal anecdotes; admit mistakes/lessons
   - Instagram: Energy and personality shine; emojis feel integrated not decorative; casual asides
   - Email: Write like you're talking to a friend; personal touches; "hey" not "hello"
   - TikTok: Script like a human talks — pauses, exclamations, real speech patterns

6. THE GOLDEN RULE:
   Read every sentence out loud. If it sounds like a press release or Wikipedia, rewrite it. Real people don't talk like content marketing guides.`;

/** Shared parser for OpenAI and Claude repurpose responses. */
export function parseRepurposeModelJson(text: string): Record<Platform, string> {
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if ("subject" in obj && "body" in obj) {
        result[key] = `Subject: ${obj.subject}\n\n${obj.body}`;
      } else if ("body" in obj) {
        result[key] = String(obj.body);
      } else {
        result[key] = JSON.stringify(value);
      }
    } else {
      result[key] = String(value ?? "");
    }
  }
  return result as Record<Platform, string>;
}

export async function repurposeContent(
  content: string,
  platforms: Platform[],
  brandVoiceSample?: string,
  outputLanguage: OutputLanguage = "en",
  userIntent?: string,
  contentAngle?: string,
  hookMode?: string,
  authenticityTuning?: AuthenticityTuning
): Promise<Record<Platform, string>> {
  const prompt = buildRepurposePrompt(
    content,
    platforms,
    brandVoiceSample,
    outputLanguage,
    userIntent,
    contentAngle,
    hookMode,
    authenticityTuning
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_JSON },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No response from AI model");
  }

  try {
    return parseRepurposeModelJson(text);
  } catch {
    throw new Error("AI returned an unexpected format. Please try again.");
  }
}

const CLAUDE_REGIONAL_MODEL = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";
/** Enhanced tier (Pro plan): Claude Haiku 4.5 — fast, good quality, moderate cost. */
const CLAUDE_ENHANCED_MODEL = process.env.ANTHROPIC_ENHANCED_MODEL?.trim() || "claude-haiku-4-5-20251001";
/** Premium tier (Agency plan): Claude Sonnet 4 — best quality, highest cost. */
const CLAUDE_PREMIUM_MODEL = process.env.ANTHROPIC_REPURPOSE_MODEL?.trim() || "claude-sonnet-4-20250514";

/**
 * Resolve which Claude model to use based on tier + language.
 * - "enhanced" (Pro)   → Haiku 4.5
 * - "premium" (Agency) → Sonnet 4
 * - Indian language on any tier → regional model (Haiku 4.5)
 */
function resolveClaudeModel(tier: AiTier, outputLanguage: string): string {
  if (isIndianLanguage(outputLanguage)) return CLAUDE_REGIONAL_MODEL;
  if (tier === "enhanced") return CLAUDE_ENHANCED_MODEL;
  return CLAUDE_PREMIUM_MODEL;
}

export async function repurposeContentClaude(
  content: string,
  platforms: Platform[],
  brandVoiceSample?: string,
  outputLanguage: OutputLanguage = "en",
  userIntent?: string,
  contentAngle?: string,
  hookMode?: string,
  authenticityTuning?: AuthenticityTuning,
  tier: AiTier = "premium"
): Promise<Record<Platform, string>> {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error(
      "Claude AI is not configured. Set ANTHROPIC_API_KEY or contact support."
    );
  }
  const prompt = buildRepurposePrompt(
    content,
    platforms,
    brandVoiceSample,
    outputLanguage,
    userIntent,
    contentAngle,
    hookMode,
    authenticityTuning
  );
  const isIndian = isIndianLanguage(outputLanguage ?? "en");
  const model = resolveClaudeModel(tier, outputLanguage ?? "en");

  const msg = await client.messages.create({
    model,
    max_tokens: 8192,
    temperature: isIndian ? 0.75 : undefined,
    system: SYSTEM_JSON,
    messages: [{ role: "user", content: prompt }],
  });
  const block = msg.content.find((b) => b.type === "text");
  const text =
    block && block.type === "text" ? block.text : "";
  if (!text?.trim()) {
    throw new Error("No response from Claude");
  }
  try {
    return parseRepurposeModelJson(text);
  } catch {
    throw new Error("Claude returned an unexpected format. Please try again.");
  }
}

/**
 * Routes AI model by plan tier:
 * - "standard" (Free/Starter) → GPT-4o-mini
 * - "enhanced" (Pro)          → Claude Haiku 4.5
 * - "premium"  (Agency)       → Claude Sonnet 4
 * Indian languages always use Claude Haiku 4.5 regardless of tier.
 */
export async function repurposeContentForTier(
  tier: AiTier,
  content: string,
  platforms: Platform[],
  brandVoiceSample?: string,
  outputLanguage?: OutputLanguage,
  userIntent?: string,
  contentAngle?: string,
  hookMode?: string,
  authenticityTuning?: AuthenticityTuning
): Promise<Record<Platform, string>> {
  const useClaudeForRegional = isIndianLanguage(outputLanguage ?? "en") && !!getAnthropicClient();
  const useClaude = tier === "premium" || tier === "enhanced" || useClaudeForRegional;

  if (useClaude) {
    try {
      return await repurposeContentClaude(
        content,
        platforms,
        brandVoiceSample,
        outputLanguage,
        userIntent,
        contentAngle,
        hookMode,
        authenticityTuning,
        tier
      );
    } catch (e) {
      console.warn("[repurpose] Claude failed, falling back to GPT-4o-mini:", e);
      return repurposeContent(
        content,
        platforms,
        brandVoiceSample,
        outputLanguage,
        userIntent,
        contentAngle,
        hookMode,
        authenticityTuning
      );
    }
  }
  return repurposeContent(
    content,
    platforms,
    brandVoiceSample,
    outputLanguage,
    userIntent,
    contentAngle,
    hookMode,
    authenticityTuning
  );
}

export async function regenerateSingle(
  originalContent: string,
  platform: Platform,
  brandVoiceSample?: string,
  outputLanguage: OutputLanguage = "en"
): Promise<string> {
  const results = await repurposeContent(
    originalContent,
    [platform],
    brandVoiceSample,
    outputLanguage
  );
  return results[platform] || "";
}
