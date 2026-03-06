import crypto from "crypto";
import { getRazorpay } from "./client";
import type { Plan } from "@/types";

const PLAN_IDS: Record<string, string | undefined> = {
  pro: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
  "pro-annual": process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  agency: process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
  "agency-annual": process.env.RAZORPAY_PLAN_AGENCY_ANNUAL,
};

export function getRazorpayPlanId(plan: Plan, billing?: "monthly" | "annual"): string | undefined {
  const key = billing === "annual" ? `${plan}-annual` : plan;
  return PLAN_IDS[key];
}

export function getPlanFromRazorpayPlanId(planId: string): Plan {
  const proIds = [
    process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    process.env.RAZORPAY_PLAN_PRO_ANNUAL,
  ];
  const agencyIds = [
    process.env.RAZORPAY_PLAN_AGENCY_MONTHLY,
    process.env.RAZORPAY_PLAN_AGENCY_ANNUAL,
  ];
  if (agencyIds.includes(planId)) return "agency";
  if (proIds.includes(planId)) return "pro";
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

/** Verify payment signature (callback). */
export function verifyPaymentSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");
  return expected === signature;
}
