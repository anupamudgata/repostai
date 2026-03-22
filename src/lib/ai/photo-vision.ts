import { openai } from "@/lib/ai/client";

export interface VisionAnalysis {
  description: string;
  mainSubject: string;
  setting: string;
  mood: string;
  colors: string[];
  textVisible: string | null;
  marketingAngles: string[];
  suggestedHashtags: string[];
}

const VISION_MODEL =
  process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";

export async function analyzePhotoBuffer(
  imageJpeg: Buffer,
  userContext?: string
): Promise<VisionAnalysis> {
  const b64 = imageJpeg.toString("base64");
  const dataUrl = `data:image/jpeg;base64,${b64}`;

  const contextBlock = userContext?.trim()
    ? `\nAdditional context from the user: ${userContext.trim()}`
    : "";

  const prompt = `Analyze this image for social media marketing.${contextBlock}

Return JSON only with these exact keys:
{
  "description": "2-3 sentence description",
  "mainSubject": "main focus",
  "setting": "environment",
  "mood": "emotion conveyed",
  "colors": ["dominant colors"],
  "textVisible": "any readable text in the image or null",
  "marketingAngles": ["3-5 engagement angles"],
  "suggestedHashtags": ["5-10 hashtags without # prefix"]
}`;

  const response = await openai.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
        ],
      },
    ],
    max_tokens: 1200,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from vision model");

  const parsed = JSON.parse(content) as VisionAnalysis;
  if (!parsed.description || !parsed.mainSubject) {
    throw new Error("Vision model returned incomplete analysis");
  }
  return {
    description: parsed.description,
    mainSubject: parsed.mainSubject,
    setting: parsed.setting ?? "",
    mood: parsed.mood ?? "",
    colors: Array.isArray(parsed.colors) ? parsed.colors : [],
    textVisible:
      parsed.textVisible === undefined || parsed.textVisible === ""
        ? null
        : String(parsed.textVisible),
    marketingAngles: Array.isArray(parsed.marketingAngles)
      ? parsed.marketingAngles
      : [],
    suggestedHashtags: Array.isArray(parsed.suggestedHashtags)
      ? parsed.suggestedHashtags
      : [],
  };
}

export function buildCaptionBriefFromVision(
  analysis: VisionAnalysis,
  userContext?: string
): string {
  const lines = [
    `Image description: ${analysis.description}`,
    `Main subject: ${analysis.mainSubject}`,
    `Setting: ${analysis.setting}`,
    `Mood: ${analysis.mood}`,
    `Colors: ${analysis.colors.join(", ")}`,
    analysis.textVisible ? `Text in image: ${analysis.textVisible}` : null,
    `Marketing angles: ${analysis.marketingAngles.join("; ")}`,
    `Suggested hashtags (reference): ${analysis.suggestedHashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`,
    userContext?.trim() ? `User context: ${userContext.trim()}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}
