// src/lib/razorpay/config.ts
// FIXED: Lazy initialization — never throws at build time
// Razorpay missing env vars was causing build crashes on pages
// that never use Razorpay (like the landing page)

import Razorpay from "razorpay";

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_razorpay) {
    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId)     throw new Error("Missing RAZORPAY_KEY_ID");
    if (!keySecret) throw new Error("Missing RAZORPAY_KEY_SECRET");

    _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return _razorpay;
}

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop: string) {
    return getRazorpay()[prop as keyof Razorpay];
  },
});

// Your public key (safe to expose in browser)
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
