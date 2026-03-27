import { NextRequest }                   from "next/server";
import { createClient }                  from "@/lib/supabase/server";
import { extractBrief }                  from "@/lib/ai/repurpose";
import { getOrGeneratePersona }          from "@/lib/ai/brand-voice-cache";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { burstLimiter, freeTierLimiter, proTierLimiter, agencyTierLimiter } from "@/lib/ratelimit";
import { captureError }                  from "@/lib/sentry";
import { openai } from "@/lib/ai/client";
import { getAnthropicClient, ANTHROPIC_REQUIRED_FOR_INDIAN_LANGUAGES } from "@/lib/ai/anthropic";
import {
  buildLinkedInPrompt, buildTwitterThreadPrompt, buildTwitterSinglePrompt,
  buildInstagramPrompt, buildFacebookPrompt, buildRedditPrompt, buildEmailPrompt,
  buildTikTokPrompt, buildWhatsAppStatusPrompt,
} from "@/lib/ai/prompts/platforms";
import { getHindiStreamSystemPrompt, getHindiPlatformSupplementForStream } from "@/lib/prompts/hindi";
import { applyOdiaSocialMediaGuards } from "@/lib/ai/odia-social-prompt";
import { isIndianLanguage } from "@/lib/ai/types";
import { getRegionalPrompts } from "@/lib/prompts/regional";
import type { Platform, Language, ContentBrief }  from "@/lib/ai/types";

const CLAUDE_REGIONAL_MODEL = process.env.ANTHROPIC_HINDI_MODEL?.trim() || "claude-haiku-4-5-20251001";


type SSEEventType = "brief_ready" | "platform_start" | "platform_chunk" | "platform_done" | "platform_error" | "all_done" | "error";

interface SSEPayload {
  type:        SSEEventType;
  platform?:   Platform;
  chunk?:      string;
  content?:    string;
  tweets?:     string[];
  subject?:    string;
  title?:      string;
  hashtags?:   string[];
  brief?:      ContentBrief;
  durationMs?: number;
  error?:      string;
  remaining?:  number;
}

function sseEvent(payload: SSEPayload): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
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
  };
}

const TEMPERATURES: Record<Platform, number> = {
  linkedin: 0.75, twitter_thread: 0.80, twitter_single: 0.85,
  instagram: 0.80, facebook: 0.75, reddit: 0.70, email: 0.72,
  tiktok: 0.85, whatsapp_status: 0.80,
};

const SYSTEM_MSG = "You are a specialist social media content writer. Follow all instructions exactly. Respect all character limits strictly.";

async function* streamClaudeSinglePass(
  platform: Platform,
  brief: ContentBrief,
  voice: string | null,
  language: Language
): AsyncGenerator<string> {
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

  const stream = anthropic.messages.stream({
    model: CLAUDE_REGIONAL_MODEL,
    max_tokens: 2048,
    temperature,
    system: finalSystem,
    messages: [{ role: "user", content: userPrompt }],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

async function* streamPlatformAgentClaude(platform: Platform, brief: ContentBrief, voice: string | null, language: Language): AsyncGenerator<string> {
  yield* streamClaudeSinglePass(platform, brief, voice, language);
}

async function* streamPlatformAgent(platform: Platform, brief: ContentBrief, voice: string | null, language: Language): AsyncGenerator<string> {
  if (isIndianLanguage(language)) {
    yield* streamPlatformAgentClaude(platform, brief, voice, language);
    return;
  }
  const promptBuilders = getPromptBuilders(brief, voice, language);
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini", temperature: TEMPERATURES[platform], stream: true,
    messages: [
      { role: "system", content: SYSTEM_MSG },
      { role: "user", content: promptBuilders[platform]() },
    ],
  });
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) yield token;
  }
}

function parseStreamedOutput(platform: Platform, raw: string): Partial<SSEPayload> {
  const jsonPlatforms: Platform[] = ["twitter_thread", "instagram", "reddit", "email"];
  if (!jsonPlatforms.includes(platform)) return { content: raw.trim() };
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (platform === "twitter_thread") return { content: parsed.tweets?.join("\n\n") ?? raw, tweets: parsed.tweets ?? [] };
    if (platform === "instagram")      return { content: parsed.caption ?? raw, hashtags: parsed.hashtags ?? [] };
    if (platform === "reddit")         return { title: parsed.title ?? "", content: parsed.body ?? raw };
    if (platform === "email")          return { subject: parsed.subject ?? "", content: parsed.body ?? raw };
  } catch { /* fallthrough */ }
  return { content: raw.trim() };
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const stream  = new ReadableStream({
    async start(controller) {
      const send  = (p: SSEPayload) => { try { controller.enqueue(encoder.encode(sseEvent(p))); } catch { /* client disconnected */ } };
      const close = () => { try { controller.close(); } catch { /* already closed */ } };

      try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { send({ type: "error", error: "Unauthorized." }); close(); return; }

        const burst = await burstLimiter.limit(user.id);
        if (!burst.success) { send({ type: "error", error: "Too many requests. Please slow down." }); close(); return; }

        const { plan: effectivePlan, isSuperUser } = await getEffectivePlan(
          supabase,
          user.id,
          user.email
        );
        const entitlements = getEntitlements(effectivePlan);

        const currentMonth = new Date().toISOString().slice(0, 7);
        const { data: usageRow } = await supabase
          .from("usage")
          .select("repurpose_count")
          .eq("user_id", user.id)
          .eq("month", currentMonth)
          .single();
        const used = usageRow?.repurpose_count ?? 0;
        if (!isSuperUser && entitlements.repurposesPerMonth != null) {
          if (used >= entitlements.repurposesPerMonth) {
            send({
              type: "error",
              error: `Monthly repurpose limit reached (${entitlements.repurposesPerMonth}). Upgrade for more.`,
            });
            close();
            return;
          }
        }

        const limiter =
          effectivePlan === "agency"
            ? agencyTierLimiter
            : effectivePlan === "pro" ||
                effectivePlan === "starter"
              ? proTierLimiter
              : freeTierLimiter;
        const tierResult = await limiter.limit(user.id);
        if (!tierResult.success) {
          send({
            type: "error",
            error:
              effectivePlan === "free"
                ? "Too many streaming requests. Please wait or upgrade to Starter or Pro."
                : "Daily streaming limit reached. Resets at midnight UTC.",
          });
          close();
          return;
        }

        const body = await req.json();
        const { content, platforms, language = "en", brandVoiceId } = body as { content: string; platforms: Platform[]; language?: Language; brandVoiceId?: string };
        if (!content?.trim() || !platforms?.length) { send({ type: "error", error: "Content and platforms are required." }); close(); return; }

        if (entitlements.allowedPlatformIds) {
          const allow = entitlements.allowedPlatformIds as readonly string[];
          const ok = platforms.every((p) => allow.includes(p));
          if (!ok) {
            send({
              type: "error",
              error:
                "Your plan includes LinkedIn, Twitter/X, and Instagram only. Upgrade for all platforms.",
            });
            close();
            return;
          }
        }

        const brief = await extractBrief(content, language);
        brief.rawContent = content;
        send({ type: "brief_ready", brief });

        let voicePersona: string | null = null;
        if (brandVoiceId) {
          try { const { persona } = await getOrGeneratePersona(brandVoiceId); voicePersona = persona; } catch { /* non-fatal */ }
        }

        const startTime = Date.now();
        await Promise.allSettled(platforms.map(async (platform) => {
          const platformStart = Date.now();
          send({ type: "platform_start", platform });
          try {
            let accumulated = "";
            for await (const token of streamPlatformAgent(platform, brief, voicePersona, language)) {
              accumulated += token;
              send({ type: "platform_chunk", platform, chunk: token });
            }
            const parsed = parseStreamedOutput(platform, accumulated);
            send({ type: "platform_done", platform, durationMs: Date.now() - platformStart, ...parsed });
          } catch (err) {
            captureError(err, { userId: user.id, action: "stream_platform_agent", extra: { platform } });
            const fallback = "Generation failed. Click regenerate to try again.";
            const message =
              err instanceof Error && err.message.includes("ANTHROPIC_API_KEY")
                ? err.message
                : fallback;
            send({ type: "platform_error", platform, error: message });
          }
        }));

        if (!isSuperUser) {
          await supabase.rpc("increment_usage", {
            p_user_id: user.id,
            p_month: currentMonth,
          });
        }

        send({ type: "all_done", durationMs: Date.now() - startTime, remaining: tierResult.remaining });
      } catch (err) {
        captureError(err, { action: "repurpose_stream" });
        send({ type: "error", error: "Unexpected error. Please try again." });
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
