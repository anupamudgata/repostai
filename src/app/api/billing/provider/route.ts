import { NextResponse } from "next/server";

/** Returns which payment provider is configured (for client to choose checkout flow). */
export async function GET() {
  const useRazorpay =
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  return NextResponse.json({
    provider: useRazorpay ? "razorpay" : "stripe",
  });
}
