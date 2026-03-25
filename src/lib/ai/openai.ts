import { openai } from "./client";
import type { Platform, OutputLanguage } from "@/types";
import { buildRepurposePrompt, type AuthenticityTuning } from "./prompts";
import { getAnthropicClient } from "./anthropic";
import type { AiTier } from "@/lib/billing/plan-entitlements";

const SYSTEM_JSON =
  "You are a content repurposing expert. Follow the best-practices and structure examples given per platform — they are based on high-performing posts. Always return valid JSON only, with no markdown formatting or extra text.";

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

const CLAUDE_HINDI_MODEL = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";
const CLAUDE_PREMIUM_MODEL = process.env.ANTHROPIC_REPURPOSE_MODEL?.trim() || "claude-sonnet-4-20250514";

export async function repurposeContentClaude(
  content: string,
  platforms: Platform[],
  brandVoiceSample?: string,
  outputLanguage: OutputLanguage = "en",
  userIntent?: string,
  contentAngle?: string,
  hookMode?: string,
  authenticityTuning?: AuthenticityTuning
): Promise<Record<Platform, string>> {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error(
      "Premium AI (Claude) is not configured. Set ANTHROPIC_API_KEY or contact support."
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
  const model = outputLanguage === "hi" ? CLAUDE_HINDI_MODEL : CLAUDE_PREMIUM_MODEL;

  const msg = await client.messages.create({
    model,
    max_tokens: 8192,
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

/** Routes premium (Claude) vs standard (GPT-4o-mini). Hindi always uses Claude Haiku 4.5. */
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
  const useClaudeForHindi = outputLanguage === "hi" && !!getAnthropicClient();
  if (tier === "premium" || useClaudeForHindi) {
    try {
      return await repurposeContentClaude(
        content,
        platforms,
        brandVoiceSample,
        outputLanguage,
        userIntent,
        contentAngle,
        hookMode,
        authenticityTuning
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
