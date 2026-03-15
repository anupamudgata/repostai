// src/lib/analytics/posthog.server.ts
import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

function getPostHogServer(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;
  if (process.env.NODE_ENV !== "production") return null;
  if (!_client) {
    _client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

export const posthogServer = getPostHogServer();
