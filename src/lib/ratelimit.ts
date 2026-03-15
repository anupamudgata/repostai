import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const freeTierLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "30 d"),
  analytics: true,
  prefix: "repostai:free",
});

export const proTierLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, "1 d"),
  analytics: true,
  prefix: "repostai:pro",
});

export const agencyTierLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(500, "1 d"),
  analytics: true,
  prefix: "repostai:agency",
});

export const burstLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "repostai:burst",
});
