import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment configuration error" },
        { status: 500 }
      );
    }

    const expectedBuf = Buffer.from(
      crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex")
    );
    const receivedBuf = Buffer.from(String(razorpay_signature ?? ""));
    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    const { supabaseAdmin } = await import("@/lib/supabase/admin");

    const { data: order, error: orderError } = await supabaseAdmin
      .from("razorpay_orders")
      .select("user_id, plan")
      .eq("razorpay_order_id", razorpay_order_id)
      .single();

    if (orderError || !order) {
      console.error("[razorpay] Order lookup failed:", orderError);
      return NextResponse.json(
        { error: "Order not found. Contact support." },
        { status: 404 }
      );
    }

    const { user_id, plan } = order;

    const { error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id,
          plan,
          status: "active",
          razorpay_order_id,
          razorpay_payment_id,
          updated_at: new Date().toISOString(),
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

    await supabaseAdmin
      .from("profiles")
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
