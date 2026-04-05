import { openai } from "@/lib/ai/client";
import {
  buildLinkedInPrompt,
  buildTwitterSinglePrompt,
} from "@/lib/ai/prompts/platforms";
import type { ContentBrief } from "@/lib/ai/types";
import { getOrGeneratePersona } from "@/lib/ai/brand-voice-cache";

const PREVIEW_SYSTEM =
  "You are a specialist social media content writer. Follow all instructions exactly. Respect character limits.";

function briefFromTopic(topic: string): ContentBrief {
  const t = topic.trim();
  return {
    coreMessage: t,
    keyPoints: t.length > 0 ? [t.slice(0, 160)] : [],
    audience: "your audience",
    tone: "conversational",
    contentType: "text",
    rawContent: t,
  };
}

export type BrandVoicePreviewPlatform = "linkedin" | "twitter_single";

/** One-off sample post for Brand Voice page; does not create repurpose jobs. */
export async function runBrandVoicePreview(
  brandVoiceId: string,
  topic: string,
  platform: BrandVoicePreviewPlatform
): Promise<string> {
  const { persona } = await getOrGeneratePersona(brandVoiceId);
  const brief = briefFromTopic(topic);
  const userPrompt =
    platform === "linkedin"
      ? buildLinkedInPrompt(brief, persona, "en")
      : buildTwitterSinglePrompt(brief, persona, "en");
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: platform === "linkedin" ? 0.75 : 0.85,
    max_tokens: platform === "linkedin" ? 900 : 200,
    messages: [
      { role: "system", content: PREVIEW_SYSTEM },
      { role: "user", content: userPrompt },
    ],
  });
  const raw = response.choices[0]?.message?.content?.trim() ?? "";
  if (!raw) throw new Error("Empty preview");
  return raw;
}
