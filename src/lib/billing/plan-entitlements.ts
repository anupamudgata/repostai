import type { SupabaseClient } from "@supabase/supabase-js";
import { FREE_PLATFORM_IDS, SUPERUSER_EMAIL } from "@/config/constants";

export type PaidPlan = "free" | "starter" | "pro" | "agency";

/** Razorpay stores subscription id in `subscriptions.stripe_subscription_id` (legacy column name). */

export type AiTier = "standard" | "premium";

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
    repurposesPerMonth: 10,
    allowedPlatformIds: FREE_PLATFORM_IDS as readonly string[],
    brandVoicesMax: 1,
    aiTier: "standard",
    photosPerMonth: 0,
  },
  starter: {
    repurposesPerMonth: 10,
    allowedPlatformIds: null,
    brandVoicesMax: 1,
    aiTier: "standard",
    photosPerMonth: 10,
  },
  pro: {
    repurposesPerMonth: 60,
    allowedPlatformIds: null,
    brandVoicesMax: 3,
    aiTier: "premium",
    photosPerMonth: 40,
  },
  agency: {
    repurposesPerMonth: null,
    allowedPlatformIds: null,
    brandVoicesMax: 5,
    aiTier: "premium",
    photosPerMonth: null,
  },
};

export function getEntitlements(plan: PaidPlan): PlanEntitlements {
  return ENTITLEMENTS[plan] ?? ENTITLEMENTS.free;
}

export function getBrandVoiceLimit(plan: PaidPlan): number {
  return getEntitlements(plan).brandVoicesMax;
}

/**
 * Single source of truth: active/trialing subscription overrides profile when present;
 * otherwise profiles.plan. Superuser → pro for limits (existing behavior).
 */
export async function getEffectivePlan(
  supabase: SupabaseClient,
  userId: string,
  email: string | undefined
): Promise<{ plan: PaidPlan; isSuperUser: boolean }> {
  if (email === SUPERUSER_EMAIL) {
    return { plan: "pro", isSuperUser: true };
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const p = profile?.plan;
  if (p === "agency" || p === "pro" || p === "starter") {
    return { plan: p, isSuperUser: false };
  }
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
