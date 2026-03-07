import Stripe from "stripe";

let _instance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_instance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Stripe is not configured");
    }
    _instance = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _instance;
}
