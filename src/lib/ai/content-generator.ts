import { openai } from "./client";
import type { ContentTone, ContentLength, OutputLanguage } from "@/types";
import { LENGTH_OPTIONS } from "@/config/constants";

const TONE_INSTRUCTIONS: Record<ContentTone, string> = {
  professional:
    "Write in a clear, authoritative, business-appropriate tone. Use data-driven language and structured arguments. Avoid slang.",
  casual:
    "Write in a friendly, relatable, conversational tone. Use contractions, simple words, and short sentences. Feel approachable.",
  humorous:
    "Write with wit and humor. Use clever analogies, playful language, and unexpected turns. Keep it entertaining but still valuable.",
  inspirational:
    "Write in a motivating, uplifting tone. Use vivid imagery, powerful verbs, and emotional appeals. Make the reader feel empowered.",
  educational:
    "Write in an informative, structured, teacher-like tone. Use clear explanations, examples, and logical flow. Prioritize clarity above all.",
};

function getTargetWords(length: ContentLength): number {
  return LENGTH_OPTIONS.find((l) => l.id === length)?.words ?? 600;
}

const LANGUAGE_BLOG_INSTRUCTIONS: Record<OutputLanguage, string> = {
  en: "",
  hi: `
CRITICAL: Write the ENTIRE blog post in Hindi (हिन्दी) using Devanagari script.
- Use natural, conversational Hindi — not overly formal or Sanskritized
- Mix in commonly used English tech/business words where natural
- The headline and all sections must be in Hindi`,
  es: `
CRITICAL: Write the ENTIRE blog post in Spanish (Español).
- Use natural, conversational Latin American Spanish
- The headline and all sections must be in Spanish`,
  pt: `
CRITICAL: Write the ENTIRE blog post in Portuguese (Português).
- Use natural, conversational Brazilian Portuguese
- The headline and all sections must be in Portuguese`,
  fr: `
CRITICAL: Write the ENTIRE blog post in French (Français).
- Use natural, conversational international French
- The headline and all sections must be in French`,
};

export function buildContentCreationPrompt(
  topic: string,
  tone: ContentTone,
  length: ContentLength,
  audience: string,
  outputLanguage: OutputLanguage = "en",
  brandVoice?: string
): string {
  const targetWords = getTargetWords(length);
  const toneInstruction = TONE_INSTRUCTIONS[tone];
  const langInstruction = LANGUAGE_BLOG_INSTRUCTIONS[outputLanguage];

  const voiceInstruction = brandVoice
    ? `\n\nCRITICAL - BRAND VOICE: The user's writing samples are below. The blog post MUST sound like this brand — same tone, vocabulary, and personality. Do not fall back to generic AI voice.\n---\n${brandVoice}\n---`
    : "";

  return `You are a world-class blog writer and content strategist.

TASK: Write a complete, publish-ready blog post on the given topic.

TOPIC: "${topic}"
TARGET AUDIENCE: ${audience}
TONE: ${toneInstruction}
TARGET LENGTH: ~${targetWords} words

STRUCTURE REQUIREMENTS:
1. HEADLINE — Compelling, specific, curiosity-driving. No clickbait.
2. INTRO (2-3 sentences) — Hook the reader immediately. State the problem or opportunity.
3. BODY — Organized with clear subheadings (use ##). Each section should deliver a distinct insight or actionable point.
4. CONCLUSION — Summarize the key takeaway and include a clear call-to-action.

QUALITY RULES:
- Every sentence must earn its place. No filler.
- NEVER use these phrases: "In today's fast-paced world", "It's no secret that", "In this article we will", "Without further ado", "game-changer", "leverage", "deep dive"
- Use specific examples, numbers, or stories — not vague claims
- Write for humans, not search engines. No keyword stuffing.
- Subheadings should be interesting, not generic (e.g., "Why 73% of remote teams fail at async" > "The problem with remote work")
- Use short paragraphs (2-3 sentences max)${langInstruction}${voiceInstruction}

Return the blog post as a single string. Start with the headline (as a # heading), then the content. Use markdown formatting for structure.`;
}

export async function generateBlogPost(
  topic: string,
  tone: ContentTone,
  length: ContentLength,
  audience: string,
  outputLanguage: OutputLanguage = "en",
  brandVoiceSample?: string
): Promise<string> {
  const targetWords = getTargetWords(length);
  const maxTokens = Math.max(Math.ceil(targetWords * 2), 2000);

  const prompt = buildContentCreationPrompt(
    topic,
    tone,
    length,
    audience,
    outputLanguage,
    brandVoiceSample
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional blog writer. Return ONLY the blog post content in markdown format. No JSON, no extra commentary.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: maxTokens,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No response from AI model");
  }

  return text.trim();
}
