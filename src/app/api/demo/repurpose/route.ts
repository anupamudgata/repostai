import { NextRequest, NextResponse } from "next/server";
import { repurposeContentForTier } from "@/lib/ai/openai";
import { addFreeTierWatermark } from "@/lib/watermark";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Platform } from "@/lib/ai/types";
// Platform imported for ALLOWED_PLATFORMS type annotation

export const maxDuration = 60;

const ALLOWED_PLATFORMS: Platform[] = ["linkedin", "twitter_single", "instagram", "facebook", "telegram"];
const DEMO_PLATFORMS: Platform[] = ["linkedin", "twitter_single", "instagram"];

// IP-based rate limiter: 3 demo runs per hour per IP
let _limiter: Ratelimit | null = null;
function getDemoLimiter(): Ratelimit | null {
  if (_limiter) return _limiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "repostai:demo",
  });
  return _limiter;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    const limiter = getDemoLimiter();
    if (limiter) {
      const result = await limiter.limit(ip).catch(() => ({ success: true }));
      if (!result.success) {
        return NextResponse.json(
          { error: "Demo limit reached. Sign up for unlimited access — it's free!" },
          { status: 429 }
        );
      }
    }

    const body = await req.json() as { text?: string; platforms?: string[] };
    const text = typeof body.text === "string" ? body.text.slice(0, 3000).trim() : "";
    if (!text || text.length < 20) {
      return NextResponse.json({ error: "Please enter at least 20 characters." }, { status: 400 });
    }

    const requestedPlatforms = Array.isArray(body.platforms)
      ? (body.platforms.filter((p) => ALLOWED_PLATFORMS.includes(p as Platform)) as Platform[])
      : DEMO_PLATFORMS;
    const platforms = requestedPlatforms.length > 0 ? requestedPlatforms.slice(0, 4) : DEMO_PLATFORMS;

    const raw = await repurposeContentForTier("standard", text, platforms);
    const watermarked = addFreeTierWatermark(raw);

    return NextResponse.json({ outputs: watermarked });
  } catch (e) {
    console.error("[demo/repurpose]", e);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
