import crypto from "crypto";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

const YT_CACHE_PREFIX = "repostai:yt:";
const YT_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

const REPURPOSE_CACHE_PREFIX = "repostai:repurpose:";
const REPURPOSE_CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function getCachedTranscript(videoId: string): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    const cached = await r.get<string>(`${YT_CACHE_PREFIX}${videoId}`);
    return cached;
  } catch {
    return null;
  }
}

export async function setCachedTranscript(videoId: string, transcript: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    await r.setex(`${YT_CACHE_PREFIX}${videoId}`, YT_CACHE_TTL, transcript);
  } catch {
    // ignore cache write failures
  }
}

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 32);
}

export async function getCachedRepurposeOutputs(
  content: string,
  platforms: string[],
  language: string,
  brandVoiceId: string | null,
  aiTierKey: "std" | "enh" | "prem" = "std"
): Promise<Record<string, string> | null> {
  const r = getRedis();
  if (!r) return null;
  const key = `${REPURPOSE_CACHE_PREFIX}${hashContent(content)}:${platforms.sort().join(",")}:${language}:${brandVoiceId ?? "none"}:${aiTierKey}`;
  try {
    const cached = await r.get<Record<string, string>>(key);
    return cached;
  } catch {
    return null;
  }
}

export async function setCachedRepurposeOutputs(
  content: string,
  platforms: string[],
  language: string,
  brandVoiceId: string | null,
  outputs: Record<string, string>,
  aiTierKey: "std" | "enh" | "prem" = "std"
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  const key = `${REPURPOSE_CACHE_PREFIX}${hashContent(content)}:${platforms.sort().join(",")}:${language}:${brandVoiceId ?? "none"}:${aiTierKey}`;
  try {
    await r.setex(key, REPURPOSE_CACHE_TTL, outputs);
  } catch {
    // ignore
  }
}
