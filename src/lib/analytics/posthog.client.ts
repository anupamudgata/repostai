// src/lib/analytics/posthog.client.ts
import posthog from "posthog-js";

let isInitialised = false;

export function initPostHog(): void {
  if (isInitialised || typeof window === "undefined" || process.env.NODE_ENV !== "production" || !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    ui_host:  "https://app.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    session_recording: { maskAllInputs: true },
    persistence: "localStorage+cookie",
    loaded(ph) { if (process.env.NODE_ENV === "development") ph.opt_out_capturing(); },
  });
  isInitialised = true;
}

export { posthog };
