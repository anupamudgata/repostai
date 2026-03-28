import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_PLATFORM_IDS, SUPERUSER_EMAIL } from "@/config/constants";

export type PaidPlan = "free" | "starter" | "pro" | "agency";

/** Razorpay stores subscription id in `subscriptions.stripe_subscription_id` (legacy column name). */

/**
 * AI tier controls which model family is used for content generation.
 * - "standard"  → GPT-4o-mini  (fast, cheap — Free & Starter)
 * - "enhanced"  → Claude Haiku 4.5  (better quality, moderate cost — Pro)
 * - "premium"   → Claude Sonnet 4   (best quality, highest cost — Agency)
 */
export type AiTier = "standard" | "enhanced" | "premium";

export interface PlanEntitlements {
  repurposesPerMonth: number | null;
  /** null = all platforms allowed */
  allowedPlatformIds: readonly string[] | null;
  brandVoicesMax: number;
  aiTier: AiTier;
  /** null = unlimited photo uploads / month (vision + storage) */
  photosPerMonth: number | null;
}

const ENTITLEMENTS: Record<PaidPlan, PlanEntitlements> = {
  free: {
    repurposesPerMonth: 5,
    allowedPlatformIds: FREE_PLATFORM_IDS as readonly string[],
    brandVoicesMax: 1,
    aiTier: "standard",
    photosPerMonth: 2,
  },
  starter: {
    repurposesPerMonth: 50,
    allowedPlatformIds: null,
    brandVoicesMax: 1,
    aiTier: "standard",
    photosPerMonth: 15,
  },
  pro: {
    repurposesPerMonth: 150,
    allowedPlatformIds: null,
    brandVoicesMax: 5,
    aiTier: "enhanced",
    photosPerMonth: 50,
  },
  agency: {
    repurposesPerMonth: 500,
    allowedPlatformIds: null,
    brandVoicesMax: 15,
    aiTier: "premium",
    photosPerMonth: 200,
  },
};

export function getEntitlements(plan: PaidPlan): PlanEntitlements {
  return ENTITLEMENTS[plan] ?? ENTITLEMENTS.free;
}

export function getBrandVoiceLimit(plan: PaidPlan): number {
  return getEntitlements(plan).brandVoicesMax;
}

/**
 * Single source of truth: ONLY an active/trialing subscription grants a paid plan.
 * profiles.plan is treated as a display cache — never trusted for entitlement checks.
 * Superuser → pro for limits (existing behavior).
 *
 * SECURITY: Previously this function fell back to profiles.plan, which meant a
 * stale/manipulated profile row could grant Pro without payment. Now only the
 * subscriptions table (written exclusively by verified Razorpay webhooks/callbacks)
 * can grant paid features.
 */
export async function getEffectivePlan(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<{ plan: PaidPlan; isSuperUser: boolean }> {
  if (email && SUPERUSER_EMAIL && email === SUPERUSER_EMAIL) {
    return { plan: "pro", isSuperUser: true };
  }

  const { data: sub, error: subError } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (subError) {
    console.error("[getEffectivePlan] subscription query failed:", subError.message);
    // On error, default to free — never grant paid features on uncertainty
    return { plan: "free", isSuperUser: false };
  }

  const subOk = sub?.status === "active" || sub?.status === "trialing";
  if (
    subOk &&
    sub.plan &&
    (sub.plan === "starter" ||
      sub.plan === "pro" ||
      sub.plan === "agency")
  ) {
    return { plan: sub.plan as PaidPlan, isSuperUser: false };
  }

  // No active subscription → always free, regardless of what profiles.plan says
  return { plan: "free", isSuperUser: false };
}

export function isFreePlanTier(plan: PaidPlan): boolean {
  return plan === "free";
}

/** Days until first day of next month (when usage month key rolls over). */
export function daysUntilUsageReset(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diff = next.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}
