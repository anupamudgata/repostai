import { getAnthropicClient } from "@/lib/ai/anthropic";
import { openai } from "@/lib/ai/client";
import {
  buildBrandVoiceSystemPrompt,
  buildBrandVoiceUserContent,
  type BrandVoicePersonaPreferences,
} from "@/lib/ai/prompts/brand-voice";

const OPENAI_FALLBACK_MODEL = "gpt-4o-mini";

export function getClaudeBrandVoiceModel(): string {
  return process.env.ANTHROPIC_BRAND_VOICE_MODEL ?? "claude-haiku-4-5-20251001";
}

function textFromAnthropicMessage(msg: { content: unknown }): string {
  if (!Array.isArray(msg.content)) return "";
  return msg.content
    .filter(
      (b): b is { type: "text"; text: string } =>
        typeof b === "object" &&
        b !== null &&
        (b as { type?: string }).type === "text" &&
        typeof (b as { text?: unknown }).text === "string"
    )
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Generates the cached "persona" paragraph using Claude 3.5 Haiku when ANTHROPIC_API_KEY is set,
 * otherwise OpenAI gpt-4o-mini with the same system + user split.
 */
export async function generateBrandVoicePersona(
  samples: string,
  prefs?: BrandVoicePersonaPreferences
): Promise<{ text: string; model: string }> {
  const trimmed = samples.trim();
  if (!trimmed) throw new Error("Brand voice samples are empty");

  const anthropic = getAnthropicClient();
  if (anthropic) {
    const model = getClaudeBrandVoiceModel();
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 3000,
      system: buildBrandVoiceSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildBrandVoiceUserContent(trimmed, prefs),
        },
      ],
    });
    const text = textFromAnthropicMessage(msg);
    if (!text) throw new Error("Claude returned empty persona");
    return { text, model };
  }

  const response = await openai.chat.completions.create({
    model: OPENAI_FALLBACK_MODEL,
    temperature: 0.4,
    messages: [
      { role: "system", content: buildBrandVoiceSystemPrompt() },
      { role: "user", content: buildBrandVoiceUserContent(trimmed, prefs) },
    ],
  });
  const text = response.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("OpenAI returned empty persona");
  return { text, model: OPENAI_FALLBACK_MODEL };
}
