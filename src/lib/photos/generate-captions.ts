import { getAnthropicClient } from "@/lib/ai/anthropic";
import { openai } from "@/lib/ai/client";
import type { AiTier } from "@/lib/billing/plan-entitlements";
import type { VisionAnalysis } from "@/lib/ai/photo-vision";
import { buildCaptionBriefFromVision } from "@/lib/ai/photo-vision";
import { HINDI_PHOTO_CAPTION_HINT, getHindiPhotoCaptionSystemPrompt } from "@/lib/prompts/hindi";
import { isIndianLanguage } from "@/lib/ai/types";
import { getRegionalPrompts } from "@/lib/prompts/regional";

export type PhotoPostPlatform = "instagram" | "facebook" | "twitter" | "linkedin" | "telegram";

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

  telegram: `Telegram channel post:
- Conversational, newsletter-style; 3–5 sentences
- Use emojis naturally to break up text
- 2–4 hashtags at the end only`,
};

export async function generatePhotoCaptionsForPlatforms(
  analysis: VisionAnalysis,
  platforms: PhotoPostPlatform[],
  tier: AiTier,
  outputLanguage: string,
  userContext?: string
): Promise<Record<string, string>> {
  const brief = buildCaptionBriefFromVision(analysis, userContext);
  let langNote = "Write in English.";
  if (outputLanguage === "hi") {
    langNote = `Write in natural Hinglish for Indian social media. ${HINDI_PHOTO_CAPTION_HINT}`;
  } else {
    const regional = getRegionalPrompts(outputLanguage);
    if (regional) {
      langNote = `Write in natural ${outputLanguage.toUpperCase()} code-switched style for Indian social media. ${regional.photoCaptionHint}`;
    }
  }

  const tasks = platforms
    .map(
      (p) =>
        `"${p}": ${PLATFORM_INSTRUCTIONS[p]}`
    )
    .join("\n\n");

  const baseSystem = `You write platform-native social captions from a structured image brief.
Return valid JSON only. Keys must be exactly the platform ids requested. Values are plain caption strings only (no markdown).`;

  let system = baseSystem;
  if (outputLanguage === "hi") {
    system = `${baseSystem}\n\n${getHindiPhotoCaptionSystemPrompt()}`;
  } else {
    const regional = getRegionalPrompts(outputLanguage);
    if (regional) {
      system = `${baseSystem}\n\n${regional.getPhotoCaptionSystemPrompt()}`;
    }
  }

  const user = `${langNote}

Brief:
${brief}

For each platform, follow its rules and produce one caption string.

Platforms:
${tasks}

Return a JSON object like: {"instagram":"...","facebook":"..."} with only these keys: ${platforms.map((p) => `"${p}"`).join(", ")}.`;

  const useClaudeForRegional = isIndianLanguage(outputLanguage);
  if (tier === "premium" || tier === "enhanced" || useClaudeForRegional) {
    const client = getAnthropicClient();
    if (client) {
      const hindiModel = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";
      const enhancedModel = process.env.ANTHROPIC_ENHANCED_MODEL?.trim() || "claude-haiku-4-5-20251001";
      const premiumModel = process.env.ANTHROPIC_REPURPOSE_MODEL?.trim() || "claude-sonnet-4-20250514";
      const model = useClaudeForRegional ? hindiModel : tier === "enhanced" ? enhancedModel : premiumModel;
      try {
        const msg = await client.messages.create({
          model,
          max_tokens: 4096,
          temperature: useClaudeForRegional ? 0.75 : undefined,
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

export async function generatePhotoCaptionVariations(
  analysis: VisionAnalysis,
  platforms: PhotoPostPlatform[],
  tier: AiTier,
  outputLanguage: string,
  count: number = 3,
  userContext?: string
): Promise<Record<string, string[]>> {
  const brief = buildCaptionBriefFromVision(analysis, userContext);
  let langNote = "Write in English.";
  if (outputLanguage === "hi") {
    langNote = `Write in natural Hinglish for Indian social media. ${HINDI_PHOTO_CAPTION_HINT}`;
  } else {
    const regional = getRegionalPrompts(outputLanguage);
    if (regional) {
      langNote = `Write in natural ${outputLanguage.toUpperCase()} code-switched style for Indian social media. ${regional.photoCaptionHint}`;
    }
  }

  const tasks = platforms
    .map((p) => `"${p}": ${PLATFORM_INSTRUCTIONS[p]}`)
    .join("\n\n");

  const baseSystem = `You write platform-native social captions from a structured image brief.
Return valid JSON only. Keys must be exactly the platform ids requested. Values are arrays of ${count} caption strings.
Each variation must be distinctly different — different tone, hook, and angle — while all being valid for the platform.`;

  let system = baseSystem;
  if (outputLanguage === "hi") {
    system = `${baseSystem}\n\n${getHindiPhotoCaptionSystemPrompt()}`;
  } else {
    const regional = getRegionalPrompts(outputLanguage);
    if (regional) {
      system = `${baseSystem}\n\n${regional.getPhotoCaptionSystemPrompt()}`;
    }
  }

  const user = `${langNote}

Brief:
${brief}

For each platform, produce exactly ${count} distinctly different caption variations (different tone, hook, and angle).
Each variation must follow that platform's rules.

Platforms:
${tasks}

Return a JSON object where each key is a platform id and each value is an array of ${count} caption strings.
Example format: {"instagram":["caption1","caption2","caption3"],"twitter":["tweet1","tweet2","tweet3"]}
Only include these keys: ${platforms.map((p) => `"${p}"`).join(", ")}.`;

  const useClaudeForRegional = isIndianLanguage(outputLanguage);
  if (tier === "premium" || tier === "enhanced" || useClaudeForRegional) {
    const client = getAnthropicClient();
    if (client) {
      const hindiModel = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";
      const enhancedModel = process.env.ANTHROPIC_ENHANCED_MODEL?.trim() || "claude-haiku-4-5-20251001";
      const premiumModel = process.env.ANTHROPIC_REPURPOSE_MODEL?.trim() || "claude-sonnet-4-20250514";
      const model = useClaudeForRegional ? hindiModel : tier === "enhanced" ? enhancedModel : premiumModel;
      try {
        const msg = await client.messages.create({
          model,
          max_tokens: 8192,
          temperature: useClaudeForRegional ? 0.85 : 0.8,
          system,
          messages: [{ role: "user", content: user }],
        });
        const block = msg.content.find((b) => b.type === "text");
        const text = block && block.type === "text" ? block.text : "";
        return parseCaptionVariationsJson(text, platforms, count);
      } catch (e) {
        console.warn(
          "[photo-captions-variations] Claude failed, falling back to GPT-4o-mini:",
          e
        );
        /* fall through to OpenAI below */
      }
    } else {
      console.warn(
        "[photo-captions-variations] Claude requested but ANTHROPIC_API_KEY unset; using GPT-4o-mini"
      );
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.8,
    max_tokens: 8000,
    response_format: { type: "json_object" },
  });
  const text = response.choices[0]?.message?.content ?? "";
  return parseCaptionVariationsJson(text, platforms, count);
}

function parseCaptionVariationsJson(
  text: string,
  platforms: PhotoPostPlatform[],
  count: number
): Record<string, string[]> {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as Record<string, unknown>;
  const out: Record<string, string[]> = {};
  for (const p of platforms) {
    const v = parsed[p];
    if (Array.isArray(v)) {
      out[p] = v.slice(0, count).map((item) =>
        typeof item === "string" ? item : item != null ? String(item) : ""
      );
      // Pad with empty strings if fewer than count returned
      while (out[p].length < count) {
        out[p].push("");
      }
    } else if (typeof v === "string") {
      // Fallback: AI returned a single string instead of array
      out[p] = [v, ...Array(count - 1).fill("")];
    } else {
      out[p] = Array(count).fill("");
    }
  }
  return out;
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
