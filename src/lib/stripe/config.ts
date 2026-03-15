import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY environment variable");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
  typescript: true,
});

// Maps your Stripe Price IDs to plan names
// Replace these with your actual Price IDs from Stripe dashboard
export const STRIPE_PLANS: Record<string, "pro" | "agency"> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID!]:    "pro",
  [process.env.STRIPE_PRO_ANNUAL_PRICE_ID!]:     "pro",
  [process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID!]: "agency",
  [process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID!]:  "agency",
};
