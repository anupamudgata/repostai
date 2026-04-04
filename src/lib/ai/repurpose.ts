import { openai } from "./client";
import { getAnthropicClient, ANTHROPIC_REQUIRED_FOR_INDIAN_LANGUAGES } from "./anthropic";
import { buildExtractorPrompt }    from "@/lib/ai/prompts/extractor";
import { generateBrandVoicePersona } from "@/lib/ai/brand-voice-persona";
import {
  buildLinkedInPrompt,
  buildTwitterThreadPrompt,
  buildTwitterSinglePrompt,
  buildInstagramPrompt,
  buildFacebookPrompt,
  buildRedditPrompt,
  buildEmailPrompt,
  buildTikTokPrompt,
  buildWhatsAppStatusPrompt,
  buildTelegramPrompt,
} from "@/lib/ai/prompts/platforms";
import { buildBatchQualityCheckerPrompt } from "@/lib/ai/prompts/quality-checker";
import { getHindiStreamSystemPrompt, getHindiPlatformSupplementForStream } from "@/lib/prompts/hindi";
import { applyOdiaSocialMediaGuards } from "@/lib/ai/odia-social-prompt";
import { isIndianLanguage } from "@/lib/ai/types";
import { getRegionalPrompts } from "@/lib/prompts/regional";
import type {
  Platform,
  Language,
  ContentBrief,
  PlatformOutput,
  RepurposeRequest,
  RepurposeResult,
  BrandVoice,
} from "@/lib/ai/types";
import { captureError } from "@/lib/sentry";

const MODEL = "gpt-4o-mini";
const CLAUDE_REGIONAL_MODEL = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";

export async function extractBrief(content: string, outputLanguage?: string): Promise<ContentBrief> {
  const response = await openai.chat.completions.create({
    model: MODEL, temperature: 0.3,
    messages: [{ role: "user", content: buildExtractorPrompt(content, outputLanguage) }],
  });
  const raw = response.choices[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim()) as ContentBrief;
  } catch {
    return { coreMessage: content.slice(0, 200), keyPoints: [content.slice(0, 100)], audience: "general audience", tone: "conversational", contentType: "text", rawContent: content };
  }
}

export async function extractBrandVoicePersona(
  samples: string,
  voice?: Pick<
    BrandVoice,
    "humanization_level" | "imperfection_mode" | "personal_story_injection"
  >
): Promise<string> {
  const { text } = await generateBrandVoicePersona(samples, voice);
  return text;
}

function getPromptBuilders(brief: ContentBrief, voice: string | null, language: Language): Record<Platform, () => string> {
  return {
    linkedin:        () => buildLinkedInPrompt(brief, voice, language),
    twitter_thread:  () => buildTwitterThreadPrompt(brief, voice, language),
    twitter_single:  () => buildTwitterSinglePrompt(brief, voice, language),
    instagram:       () => buildInstagramPrompt(brief, voice, language),
    facebook:        () => buildFacebookPrompt(brief, voice, language),
    reddit:          () => buildRedditPrompt(brief, voice, language),
    email:           () => buildEmailPrompt(brief, voice, language),
    tiktok:          () => buildTikTokPrompt(brief, voice, language),
    whatsapp_status: () => buildWhatsAppStatusPrompt(brief, voice, language),
    telegram:        () => buildTelegramPrompt(brief, voice, language),
  };
}

const TEMPERATURES: Record<Platform, number> = {
  linkedin: 0.75, twitter_thread: 0.80, twitter_single: 0.85,
  instagram: 0.80, facebook: 0.75, reddit: 0.70, email: 0.72,
  tiktok: 0.85, whatsapp_status: 0.80, telegram: 0.78,
};

const SYSTEM_MSG = "You are a specialist social media content writer. Follow all instructions exactly. Respect all character limits strictly.";

function parseRawOutput(platform: Platform, raw: string): PlatformOutput {
  const jsonPlatforms: Platform[] = ["twitter_thread", "instagram", "reddit", "email"];
  if (jsonPlatforms.includes(platform)) {
    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      if (platform === "twitter_thread") return { platform, content: parsed.tweets?.join("\n\n") ?? raw, tweets: parsed.tweets ?? [], charCount: (parsed.tweets ?? []).join("").length };
      if (platform === "instagram") return { platform, content: parsed.caption ?? raw, hashtags: (parsed.hashtags ?? []) as string[], charCount: (parsed.caption ?? "").length };
      if (platform === "reddit")    return { platform, title: parsed.title ?? "", content: parsed.body ?? raw, charCount: (parsed.body ?? "").length };
      if (platform === "email")     return { platform, subject: parsed.subject ?? "", content: parsed.body ?? raw, charCount: (parsed.body ?? "").length };
    } catch { /* fallthrough to raw */ }
  }
  return { platform, content: raw, charCount: raw.length };
}

async function runClaudeSinglePass(
  platform: Platform,
  brief: ContentBrief,
  voice: string | null,
  language: Language
): Promise<PlatformOutput> {
  const anthropic = getAnthropicClient();
  if (!anthropic) throw new Error(ANTHROPIC_REQUIRED_FOR_INDIAN_LANGUAGES);
  const promptBuilders = getPromptBuilders(brief, voice, language);

  let systemPrompt = SYSTEM_MSG;
  let userPrompt = promptBuilders[platform]();

  if (language === "hi") {
    systemPrompt = `${SYSTEM_MSG}\n\n${getHindiStreamSystemPrompt()}`;
    userPrompt = `${promptBuilders[platform]()}${getHindiPlatformSupplementForStream(platform)}`;
  } else {
    const regional = getRegionalPrompts(language);
    if (regional) {
      systemPrompt = `${SYSTEM_MSG}\n\n${regional.getStreamSystemPrompt()}`;
      userPrompt = `${promptBuilders[platform]()}${regional.getPlatformSupplementForStream(platform)}`;
    }
  }

  const { systemPrompt: finalSystem, temperature } = applyOdiaSocialMediaGuards(
    language,
    systemPrompt,
    TEMPERATURES[platform]
  );

  const msg = await anthropic.messages.create({
    model: CLAUDE_REGIONAL_MODEL,
    max_tokens: 2048,
    temperature,
    system: finalSystem,
    messages: [{ role: "user", content: userPrompt }],
  });
  const block = msg.content.find((b) => b.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  return parseRawOutput(platform, raw);
}

async function runPlatformAgentClaude(platform: Platform, brief: ContentBrief, voice: string | null, language: Language): Promise<PlatformOutput> {
  return runClaudeSinglePass(platform, brief, voice, language);
}

async function runPlatformAgent(platform: Platform, brief: ContentBrief, voice: string | null, language: Language): Promise<PlatformOutput> {
  if (isIndianLanguage(language)) {
    return runPlatformAgentClaude(platform, brief, voice, language);
  }
  const promptBuilders = getPromptBuilders(brief, voice, language);
  const response = await openai.chat.completions.create({
    model: MODEL, temperature: TEMPERATURES[platform],
    messages: [
      { role: "system", content: SYSTEM_MSG },
      { role: "user", content: promptBuilders[platform]() },
    ],
  });
  const raw = response.choices[0]?.message?.content ?? "";
  return parseRawOutput(platform, raw);
}

async function batchQualityCheck(
  items: { platform: Platform; output: PlatformOutput }[],
  language?: Language
): Promise<Map<Platform, { passed: boolean; fixInstruction: string }>> {
  if (items.length === 0) return new Map();
  const promptItems = items.map(({ platform, output }) => ({
    platform,
    content: platform === "twitter_thread" ? output.tweets?.join("\n---\n") ?? output.content : output.content,
  }));
  const response = await openai.chat.completions.create({
    model: MODEL, temperature: 0.1,
    messages: [{ role: "user", content: buildBatchQualityCheckerPrompt(promptItems, language) }],
  });
  const raw = response.choices[0]?.message?.content ?? "{}";
  const map = new Map<Platform, { passed: boolean; fixInstruction: string }>();
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const results = parsed.results ?? [];
    for (const r of results) {
      if (r.platform) {
        map.set(r.platform, { passed: r.passed ?? true, fixInstruction: r.fixInstruction ?? "" });
      }
    }
  } catch {
    for (const { platform } of items) map.set(platform, { passed: true, fixInstruction: "" });
  }
  return map;
}

export async function repurposeContent(req: RepurposeRequest): Promise<RepurposeResult> {
  const startTime = Date.now();
  const brief = await extractBrief(req.content, req.language);
  brief.rawContent = req.content;

  let voicePersona: string | null = null;
  if (req.brandVoice?.samples) {
    voicePersona =
      req.brandVoice.persona ??
      (await extractBrandVoicePersona(req.brandVoice.samples, req.brandVoice));
  }

  const agentResults = await Promise.allSettled(
    req.platforms.map((platform) => runPlatformAgent(platform, brief, voicePersona, req.language))
  );

  const outputs: PlatformOutput[] = [];
  const successfulOutputs: { platform: Platform; output: PlatformOutput }[] = [];
  for (let i = 0; i < agentResults.length; i++) {
    const result   = agentResults[i]!;
    const platform = req.platforms[i]!;
    if (result.status === "rejected") {
      captureError(result.reason, { action: "platform_agent", extra: { platform } });
      outputs.push({ platform, content: "", passed: false });
      continue;
    }
    successfulOutputs.push({ platform, output: result.value });
  }

  const qcMap = successfulOutputs.length > 0
    ? await batchQualityCheck(successfulOutputs, req.language)
    : new Map<Platform, { passed: boolean; fixInstruction: string }>();

  for (const { platform, output: initialOutput } of successfulOutputs) {
    const qc = qcMap.get(platform) ?? { passed: true, fixInstruction: "" };
    let output = initialOutput;
    if (!qc.passed && qc.fixInstruction) {
      try {
        const retryBrief = { ...brief, coreMessage: `${brief.coreMessage}\n\nFIX REQUIRED: ${qc.fixInstruction}` };
        output = await runPlatformAgent(platform, retryBrief, voicePersona, req.language);
      } catch (err) {
        captureError(err, { action: "platform_agent_retry", extra: { platform } });
      }
    }
    outputs.push({ ...output, passed: true });
  }
  return { brief, outputs, durationMs: Date.now() - startTime };
}
