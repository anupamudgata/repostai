// src/lib/analytics/track.ts
import { posthog }           from "@/lib/analytics/posthog.client";
import { AnalyticsEventName } from "@/lib/analytics/events";

interface TrackOptions { userId?: string; plan?: string; [key: string]: unknown; }

export function track(event: AnalyticsEventName, properties: TrackOptions = {}): void {
  try { if (typeof window !== "undefined") posthog.capture(event, properties); } catch { /* never crash */ }
}

export function identify(userId: string, traits: { email?: string; name?: string; plan?: "free" | "starter" | "pro" | "agency"; created_at?: string; [key: string]: unknown; } = {}): void {
  try { if (typeof window !== "undefined") posthog.identify(userId, traits); } catch { /* never crash */ }
}

export function resetIdentity(): void {
  try { if (typeof window !== "undefined") posthog.reset(); } catch { /* never crash */ }
}

export function setUserProperties(properties: Record<string, unknown>): void {
  try { if (typeof window !== "undefined") posthog.setPersonProperties(properties); } catch { /* never crash */ }
}
