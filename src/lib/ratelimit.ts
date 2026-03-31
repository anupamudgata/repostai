import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    _redis = null;
    return null;
  }
  _redis = new Redis({ url, token });
  return _redis;
}

/** When Redis is not configured (e.g. CI build), allow all requests. */
const noopLimit = async () =>
  ({
    success: true,
    limit: 999,
    remaining: 999,
    reset: Date.now(),
  }) as Awaited<ReturnType<Ratelimit["limit"]>>;

function makeLimiter(
  factory: (redis: Redis) => Ratelimit
): Ratelimit {
  let cached: Ratelimit | null = null;
  return new Proxy({} as Ratelimit, {
    get(_, prop) {
      if (prop === "limit") {
        return async (id: string) => {
          const r = getRedis();
          if (!r) return noopLimit();
          if (!cached) cached = factory(r);
          try {
            return await cached.limit(id);
          } catch (e) {
            // Bad URL/token, DNS, firewall, or Upstash outage — message is often "fetch failed"
            console.warn(
              "[ratelimit] Redis limit failed, allowing request:",
              e instanceof Error ? e.message : e
            );
            return noopLimit();
          }
        };
      }
      const r = getRedis();
      if (!r) {
        if (prop === "resetUsedTokens" || prop === "resetUsedTokensForIdentifier") {
          return async () => {};
        }
        return () => {};
      }
      if (!cached) cached = factory(r);
      const v = (cached as unknown as Record<string, unknown>)[prop as string];
      return typeof v === "function" ? v.bind(cached) : v;
    },
  });
}

/** Free tier: effectively unlimited (with watermark). High limit for abuse protection only. */
export const freeTierLimiter = makeLimiter((redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "30 d"),
    analytics: true,
    prefix: "repostai:free",
  })
);

export const proTierLimiter = makeLimiter((redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 d"),
    analytics: true,
    prefix: "repostai:pro",
  })
);

export const agencyTierLimiter = makeLimiter((redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, "1 d"),
    analytics: true,
    prefix: "repostai:agency",
  })
);

export const burstLimiter = makeLimiter((redis) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "repostai:burst",
  })
);
