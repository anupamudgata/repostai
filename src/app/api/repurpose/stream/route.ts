import { NextRequest }                   from "next/server";
import { createClient }                  from "@/lib/supabase/server";
import { supabaseAdmin }                 from "@/lib/supabase/admin";
import { extractBrief }                  from "@/lib/ai/repurpose";
import { getOrGeneratePersona }          from "@/lib/ai/brand-voice-cache";
import { SUPERUSER_EMAIL } from "@/config/constants";
import { burstLimiter, freeTierLimiter, proTierLimiter, agencyTierLimiter } from "@/lib/ratelimit";
import { captureError }                  from "@/lib/sentry";
import OpenAI                            from "openai";
import {
  buildLinkedInPrompt, buildTwitterThreadPrompt, buildTwitterSinglePrompt,
  buildInstagramPrompt, buildFacebookPrompt, buildRedditPrompt, buildEmailPrompt,
} from "@/lib/ai/prompts/platforms";
import type { Platform, Language, ContentBrief }  from "@/lib/ai/types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function* streamPlatformAgent(platform: Platform, brief: ContentBrief, voice: string | null, language: Language): AsyncGenerator<string> {
  const promptBuilders: Record<Platform, () => string> = {
    linkedin:       () => buildLinkedInPrompt(brief, voice, language),
    twitter_thread: () => buildTwitterThreadPrompt(brief, voice, language),
    twitter_single: () => buildTwitterSinglePrompt(brief, voice, language),
    instagram:      () => buildInstagramPrompt(brief, voice, language),
    facebook:       () => buildFacebookPrompt(brief, voice, language),
    reddit:         () => buildRedditPrompt(brief, voice, language),
    email:          () => buildEmailPrompt(brief, voice, language),
  };
  const temperatures: Record<Platform, number> = {
    linkedin: 0.75, twitter_thread: 0.80, twitter_single: 0.85,
    instagram: 0.80, facebook: 0.75, reddit: 0.70, email: 0.72,
  };
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini", temperature: temperatures[platform], stream: true,
    messages: [
      { role: "system", content: "You are a specialist social media content writer. Follow all instructions exactly. Respect all character limits strictly." },
      { role: "user",   content: promptBuilders[platform]() },
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

        const isSuperUser = user.email === SUPERUSER_EMAIL;
        const { data: sub } = await supabaseAdmin.from("subscriptions").select("plan, status").eq("user_id", user.id).single();
        const plan    = isSuperUser ? "pro" : (sub?.status === "active" ? sub.plan : "free");
        const limiter = plan === "agency" ? agencyTierLimiter : plan === "pro" ? proTierLimiter : freeTierLimiter;
        const tierResult = await limiter.limit(user.id);
        if (!tierResult.success) {
          send({ type: "error", error: plan === "free" ? "You have used all 5 free repurposes this month. Upgrade to Pro for unlimited." : "Daily limit reached. Resets at midnight UTC." });
          close(); return;
        }

        const body = await req.json();
        const { content, platforms, language = "en", brandVoiceId } = body as { content: string; platforms: Platform[]; language?: Language; brandVoiceId?: string };
        if (!content?.trim() || !platforms?.length) { send({ type: "error", error: "Content and platforms are required." }); close(); return; }

        const brief = await extractBrief(content);
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
            send({ type: "platform_error", platform, error: "Generation failed. Click regenerate to try again." });
          }
        }));

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
