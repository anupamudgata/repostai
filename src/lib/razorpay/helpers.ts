import crypto from "crypto";
import { getRazorpay } from "./client";
import type { Plan } from "@/types";

const PLAN_IDS: Record<string, string | undefined> = {
  starter: process.env.RAZORPAY_PLAN_STARTER_MONTHLY,
  "starter-annual": process.env.RAZORPAY_PLAN_STARTER_ANNUAL,
  pro: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
  "pro-annual": process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  agency: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
  "agency-annual": process.env.RAZORPAY_PLAN_AGENCY_ANNUAL,
};

export function getRazorpayPlanId(plan: Plan, billing?: "monthly" | "annual"): string | undefined {
  const key = billing === "annual" ? `${plan}-annual` : plan;
  return PLAN_IDS[key];
}

/** Map Razorpay plan_id to app plan. Env entries must be non-empty; unknown IDs → free. */
export function getPlanFromRazorpayPlanId(
  planId: string | undefined | null
): Plan {
  if (planId == null || typeof planId !== "string") return "free";
  const id = planId.trim();
  if (!id) return "free";

  const starterIds = [
    process.env.RAZORPAY_PLAN_STARTER_MONTHLY,
    process.env.RAZORPAY_PLAN_STARTER_ANNUAL,
  ].filter((x): x is string => Boolean(x));
  const proIds = [
    process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  ].filter((x): x is string => Boolean(x));
  const agencyIds = [
    process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
    process.env.RAZORPAY_PLAN_AGENCY_ANNUAL,
  ].filter((x): x is string => Boolean(x));

  if (agencyIds.includes(id)) return "agency";
  if (proIds.includes(id)) return "pro";
  if (starterIds.includes(id)) return "starter";
  return "free";
}

/** Create a subscription; returns subscription id for client checkout. */
export async function createSubscription(
  planId: string,
  userId: string,
  billing: "monthly" | "annual"
): Promise<{ subscriptionId: string }> {
  const totalCount = billing === "annual" ? 1 : 12; // 1 year cycle or 12 months
  const sub = await getRazorpay().subscriptions.create({
    plan_id: planId,
    total_count: totalCount,
    quantity: 1,
    customer_notify: 1,
    notes: { user_id: userId },
  });
  return { subscriptionId: (sub as { id: string }).id };
}

/** Verify payment signature (callback) using timing-safe comparison. */
export function verifyPaymentSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !paymentId || !subscriptionId || !signature) {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Confirm with Razorpay that the subscription payment is captured and tied to this subscription.
 * Do not grant paid features without this (redirect URL alone is insufficient).
 */
export async function verifySubscriptionPaymentCaptured(
  paymentId: string,
  subscriptionId: string
): Promise<boolean> {
  try {
    const payment = (await getRazorpay().payments.fetch(paymentId)) as {
      status: string;
      subscription_id?: string | null;
    };
    if (payment.status !== "captured") {
      console.warn(
        "[razorpay] Subscription payment not captured:",
        payment.status
      );
      return false;
    }
    if (
      payment.subscription_id != null &&
      payment.subscription_id !== "" &&
      payment.subscription_id !== subscriptionId
    ) {
      console.warn("[razorpay] Payment subscription_id does not match callback");
      return false;
    }
    return true;
  } catch (e) {
    console.error("[razorpay] payments.fetch failed:", e);
    return false;
  }
}
