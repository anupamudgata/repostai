// src/lib/stripe/config.ts
// FIXED: Lazy initialization — never throws at build time
// This is why your landing page was crashing in production

import Stripe from "stripe";

// All plan price ID mappings
export const STRIPE_PLANS: Record<string, "pro" | "agency"> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID    ?? ""]: "pro",
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID     ?? ""]: "pro",
  [process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID ?? ""]: "agency",
  [process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID  ?? ""]: "agency",
};

// ── Lazy singleton — only instantiated when first called ─────────────────────
// This is critical. If you do `new Stripe(...)` at module top level and
// STRIPE_SECRET_KEY is not set in Vercel, Next.js crashes the ENTIRE build
// including the landing page — even though the landing page never uses Stripe.

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "Missing STRIPE_SECRET_KEY — add it to Vercel environment variables"
      );
    }
    _stripe = new Stripe(key, {
      apiVersion: "2024-12-18.acacia",
      typescript: true,
    });
  }
  return _stripe;
}

// Proxy so all existing code using `stripe.xxx` still works without changes
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string) {
    return getStripe()[prop as keyof Stripe];
  },
});
