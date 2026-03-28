import { NextRequest }                   from "next/server";
import { createClient }                  from "@/lib/supabase/server";
import { ensureProfileForUser }          from "@/lib/supabase/ensure-profile";
import { extractBrief }                  from "@/lib/ai/repurpose";
import { getOrGeneratePersona }          from "@/lib/ai/brand-voice-cache";
import {
  getEffectivePlan,
  getEntitlements,
  type AiTier,
} from "@/lib/billing/plan-entitlements";
import { burstLimiter } from "@/lib/ratelimit";
import { addFreeTierWatermark }          from "@/lib/watermark";
import { captureError }                  from "@/lib/sentry";
import {
  insertRepurposeJobWithFallback,
  isLikelyUserProfileFkError,
} from "@/lib/supabase/insert-repurpose-job";
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
const CLAUDE_ENHANCED_MODEL = process.env.ANTHROPIC_ENHANCED_MODEL?.trim() || "claude-haiku-4-5-20251001";
const CLAUDE_PREMIUM_MODEL  = process.env.ANTHROPIC_REPURPOSE_MODEL?.trim() || "claude-sonnet-4-20250514";

/** Resolve Claude model for streaming based on tier + language. */
function resolveStreamClaudeModel(aiTier: AiTier, language: Language): string {
  if (isIndianLanguage(language)) return CLAUDE_REGIONAL_MODEL;
  if (aiTier === "enhanced") return CLAUDE_ENHANCED_MODEL;
  return CLAUDE_PREMIUM_MODEL;
}


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
  /** Resolved platform list after plan filtering (may be shorter than the client request). */
  platforms?:  Platform[];
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

const SYSTEM_MSG = `You are a specialist social media content writer. Follow all instructions exactly. Respect all character limits strictly.

CRITICAL: Write like a HUMAN creator, not an AI. Users should never guess "this was written by AI". Here's how:

1. AVOID THESE AI TELLS (common giveaways):
   - "In today's fast-paced digital world..." / "The landscape is constantly evolving..." / "In conclusion..."
   - Lists starting with "Here are X ways..." / "First and foremost..." / "It's important to note..."
   - Overuse of power words: "amazing", "incredible", "revolutionary", "game-changing"
   - Perfect grammar everywhere (real people use contractions, fragments, casual phrasing)
   - Robotic transitions: "Furthermore", "As mentioned earlier", "To summarize"

2. EMBRACE HUMAN PATTERNS:
   - Contractions: "it's", "don't", "you're", "they've" (humans write this way)
   - Sentence fragments: "Turns out it works." / "Here's the thing." / "Not really."
   - Varied sentence length: Mix short punchy sentences with longer ones
   - Casual connectors: "but here's the thing", "so basically", "honestly"
   - Personal specificity: "saved me 3 hours" not "saves time"
   - Authentic skepticism: "I thought it was BS at first" not "I was initially doubtful"

3. VARIETY IS EVERYTHING:
   - Vary how you open sentences (don't start 3 posts in a row the same way)
   - Vary sentence length: short, short, medium, long = more engaging
   - Vary emotional tone: don't be consistently cheerful or serious

4. PLATFORM-SPECIFIC HUMANITY:
   - Twitter: Conversational asides, real reactions, half-finished thoughts
   - LinkedIn: Professional but warm; use "I" and personal anecdotes; admit mistakes
   - Instagram: Energy and personality; emojis feel integrated not decorative
   - Email: Write like you're talking to a friend; personal touches
   - TikTok: Script like a human talks — pauses, exclamations, real speech patterns

5. THE GOLDEN RULE:
   Read every sentence out loud. If it sounds like a press release or Wikipedia, rewrite it.`;

async function* streamClaudeSinglePass(
  platform: Platform,
  brief: ContentBrief,
  voice: string | null,
  language: Language,
  claudeModel: string = CLAUDE_REGIONAL_MODEL
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
    model: claudeModel,
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

/**
 * Routes streaming by plan tier:
 * - "standard" (Free/Starter) → GPT-4o-mini; Claude Haiku for Indian languages only
 * - "enhanced" (Pro)          → Claude Haiku 4.5 for all languages
 * - "premium"  (Agency)       → Claude Sonnet 4 for all languages
 */
async function* streamPlatformAgent(
  platform: Platform,
  brief: ContentBrief,
  voice: string | null,
  language: Language,
  aiTier: AiTier
): AsyncGenerator<string> {
  const useClaudeForRegional = isIndianLanguage(language) && !!getAnthropicClient();
  const useClaude = aiTier === "premium" || aiTier === "enhanced" || useClaudeForRegional;

  if (useClaude) {
    const model = resolveStreamClaudeModel(aiTier, language);
    try {
      yield* streamClaudeSinglePass(platform, brief, voice, language, model);
      return;
    } catch (e) {
      // Fall back to GPT-4o-mini only for standard tier (regional Indian language)
      if (aiTier === "standard") {
        console.warn("[stream] Claude failed for regional language, falling back to GPT-4o-mini:", e);
      } else {
        throw e; // Pro/Agency users should see the Claude error, not a silent fallback
      }
    }
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

        try {
          await ensureProfileForUser(user, supabase);
        } catch {
          send({
            type: "error",
            error:
              "Could not prepare your account profile. Refresh the page, or sign out and sign in again.",
          });
          close();
          return;
        }

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
          .maybeSingle();
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

        /** Remaining count for UI. Do not use Redis daily streaming caps (pro/agency/free) — they duplicate monthly `usage` and caused false blocks when Upstash mis-keyed or limits exhausted mid-session. */
        const streamRemaining: number | null =
          !isSuperUser && entitlements.repurposesPerMonth != null
            ? Math.max(0, entitlements.repurposesPerMonth - used - 1)
            : null;

        const body = await req.json();
        const { content, platforms, language = "en", brandVoiceId } = body as { content: string; platforms: Platform[]; language?: Language; brandVoiceId?: string };
        if (!content?.trim() || !platforms?.length) { send({ type: "error", error: "Content and platforms are required." }); close(); return; }
        if (content.length > 50000) { send({ type: "error", error: "Content is too long (max 50,000 characters)." }); close(); return; }

        /** Match POST /api/repurpose: filter to plan-allowed platforms instead of failing the whole request when one ID is out of plan. */
        let platformsToRun = platforms;
        if (entitlements.allowedPlatformIds) {
          const allow = entitlements.allowedPlatformIds as readonly string[];
          platformsToRun = platforms.filter((p) => allow.includes(p));
          if (platformsToRun.length === 0) {
            send({
              type: "error",
              error:
                "Your plan includes LinkedIn, Twitter/X, and Instagram only. Upgrade to Starter or Pro for all platforms.",
            });
            close();
            return;
          }
        }

        const brief = await extractBrief(content, language);
        brief.rawContent = content;
        send({ type: "brief_ready", brief, platforms: platformsToRun });

        let voicePersona: string | null = null;
        if (brandVoiceId) {
          try { const { persona } = await getOrGeneratePersona(brandVoiceId); voicePersona = persona; } catch { /* non-fatal */ }
        }

        const startTime = Date.now();
        const platformResults: Record<string, string> = {};
        await Promise.allSettled(platformsToRun.map(async (platform) => {
          const platformStart = Date.now();
          send({ type: "platform_start", platform });
          try {
            let accumulated = "";
            for await (const token of streamPlatformAgent(platform, brief, voicePersona, language, entitlements.aiTier)) {
              accumulated += token;
              send({ type: "platform_chunk", platform, chunk: token });
            }
            const parsed = parseStreamedOutput(platform, accumulated);
            platformResults[platform] = parsed.content ?? accumulated;
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

        // Apply free-tier watermark BEFORE saving to DB (matches /api/repurpose behaviour)
        const isFreePlan = effectivePlan === "free" && !isSuperUser;
        const resultsToSave = isFreePlan
          ? addFreeTierWatermark(platformResults as Record<string, string>)
          : platformResults;

        // Save job and outputs to DB so they appear in History
        if (Object.keys(resultsToSave).length > 0) {
          try {
            const jobPayload = {
              user_id: user.id,
              input_type: "text" as const,
              input_content: content.slice(0, 10000),
              input_url: null,
              brand_voice_id: brandVoiceId || null,
              output_language: language,
            };
            let { data: job, error: jobErr } = await insertRepurposeJobWithFallback(supabase, jobPayload);
            if (jobErr && isLikelyUserProfileFkError(jobErr)) {
              await ensureProfileForUser(user, supabase);
              ({ data: job, error: jobErr } = await insertRepurposeJobWithFallback(supabase, jobPayload));
            }
            if (job && !jobErr) {
              const outputRows = Object.entries(resultsToSave).map(([p, gen]) => ({
                job_id: job.id,
                platform: p,
                generated_content: gen,
              }));
              await supabase.from("repurpose_outputs").insert(outputRows);
            }
          } catch (saveErr) {
            captureError(saveErr, { userId: user.id, action: "stream_save_job" });
          }
        }

        if (!isSuperUser) {
          try {
            await supabase.rpc("increment_usage", {
              p_user_id: user.id,
              p_month: currentMonth,
            });
          } catch (usageErr) {
            captureError(usageErr, { userId: user.id, action: "increment_usage_stream" });
          }
        }

        send({
          type: "all_done",
          durationMs: Date.now() - startTime,
          remaining: streamRemaining ?? undefined,
        });
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
