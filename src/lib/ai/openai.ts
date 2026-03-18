import OpenAI from "openai";
import type { Platform, OutputLanguage } from "@/types";
import { buildRepurposePrompt, type AuthenticityTuning } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 60_000, // allow time for 9-platform single call or parallel batches
});

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
  const prompt = buildRepurposePrompt(content, platforms, brandVoiceSample, outputLanguage, userIntent, contentAngle, hookMode, authenticityTuning);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a content repurposing expert. Follow the best-practices and structure examples given per platform — they are based on high-performing posts. Always return valid JSON only, with no markdown formatting or extra text.",
      },
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
    const parsed = JSON.parse(text) as Record<string, unknown>;
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
  } catch {
    throw new Error(
      "AI returned an unexpected format. Please try again."
    );
  }
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
