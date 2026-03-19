// src/app/api/razorpay/callback/route.ts
// FIXED: Lazy Supabase init so build doesn't crash when env vars are missing

import { NextRequest, NextResponse } from "next/server";
import crypto                        from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id,
      plan,
    } = body;

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Lazy import Supabase — never at top level
    const { supabaseAdmin } = await import("@/lib/supabase/admin");

    // Update subscription in DB
    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id,
          plan,
          status:              "active",
          razorpay_order_id,
          razorpay_payment_id,
          updated_at:          new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (updateError) {
      console.error("[razorpay] Failed to update subscription:", updateError);
      return NextResponse.json(
        { error: "Failed to activate subscription" },
        { status: 500 }
      );
    }

    // Update user plan
    await supabaseAdmin
      .from("users")
      .update({ plan, updated_at: new Date().toISOString() })
      .eq("id", user_id);

    return NextResponse.json({ success: true, plan });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[razorpay] Callback error:", message);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
