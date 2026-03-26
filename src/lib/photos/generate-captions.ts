import { getAnthropicClient } from "@/lib/ai/anthropic";
import { openai } from "@/lib/ai/client";
import type { AiTier } from "@/lib/billing/plan-entitlements";
import type { VisionAnalysis } from "@/lib/ai/photo-vision";
import { buildCaptionBriefFromVision } from "@/lib/ai/photo-vision";
import { HINDI_PHOTO_CAPTION_HINT, getHindiPhotoCaptionSystemPrompt } from "@/lib/prompts/hindi";

export type PhotoPostPlatform = "instagram" | "facebook" | "twitter" | "linkedin";

const PLATFORM_INSTRUCTIONS: Record<
  PhotoPostPlatform,
  string
> = {
  instagram: `Instagram caption:
- 2–4 short paragraphs or lines with line breaks
- Strong first line (hook); optional 1–2 emojis if natural
- End with 8–15 relevant hashtags on their own line`,

  facebook: `Facebook post:
- Friendly, conversational; 3–5 sentences
- Light encouragement to comment or share
- 0–3 hashtags optional`,

  twitter: `X (Twitter) post:
- Max 280 characters total
- Punchy; 0–2 hashtags; avoid emoji unless very relevant`,

  linkedin: `LinkedIn post:
- Professional but human; 4–6 sentences
- Insight or lesson tied to the image
- 3–5 professional hashtags at the end`,
};

export async function generatePhotoCaptionsForPlatforms(
  analysis: VisionAnalysis,
  platforms: PhotoPostPlatform[],
  tier: AiTier,
  outputLanguage: "en" | "hi",
  userContext?: string
): Promise<Record<string, string>> {
  const brief = buildCaptionBriefFromVision(analysis, userContext);
  const langNote =
    outputLanguage === "hi"
      ? `Write in natural Hinglish for Indian social media. ${HINDI_PHOTO_CAPTION_HINT}`
      : "Write in English.";

  const tasks = platforms
    .map(
      (p) =>
        `"${p}": ${PLATFORM_INSTRUCTIONS[p]}`
    )
    .join("\n\n");

  const baseSystem = `You write platform-native social captions from a structured image brief.
Return valid JSON only. Keys must be exactly the platform ids requested. Values are plain caption strings only (no markdown).`;

  const system = outputLanguage === "hi"
    ? `${baseSystem}\n\n${getHindiPhotoCaptionSystemPrompt()}`
    : baseSystem;

  const user = `${langNote}

Brief:
${brief}

For each platform, follow its rules and produce one caption string.

Platforms:
${tasks}

Return a JSON object like: {"instagram":"...","facebook":"..."} with only these keys: ${platforms.map((p) => `"${p}"`).join(", ")}.`;

  const useClaudeForHindi = outputLanguage === "hi";
  if (tier === "premium" || useClaudeForHindi) {
    const client = getAnthropicClient();
    if (client) {
      const hindiModel = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";
      const premiumModel = process.env.ANTHROPIC_REPURPOSE_MODEL?.trim() || "claude-sonnet-4-20250514";
      const model = useClaudeForHindi ? hindiModel : premiumModel;
      try {
        const msg = await client.messages.create({
          model,
          max_tokens: 4096,
          temperature: useClaudeForHindi ? 0.75 : undefined,
          system,
          messages: [{ role: "user", content: user }],
        });
        const block = msg.content.find((b) => b.type === "text");
        const text = block && block.type === "text" ? block.text : "";
        return parseCaptionJson(text, platforms);
      } catch (e) {
        console.warn(
          "[photo-captions] Claude failed, falling back to GPT-4o-mini:",
          e
        );
        /* fall through to OpenAI below */
      }
    } else {
      console.warn(
        "[photo-captions] Claude requested but ANTHROPIC_API_KEY unset; using GPT-4o-mini"
      );
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.65,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });
  const text = response.choices[0]?.message?.content ?? "";
  return parseCaptionJson(text, platforms);
}

function parseCaptionJson(
  text: string,
  platforms: PhotoPostPlatform[]
): Record<string, string> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const p of platforms) {
    const v = parsed[p];
    out[p] = typeof v === "string" ? v : v != null ? String(v) : "";
  }
  return out;
}
