import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay/client";
import { verifyPaymentSignature, getPlanFromRazorpayPlanId } from "@/lib/razorpay/helpers";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("razorpay_payment_id");
  const subscriptionId = searchParams.get("razorpay_subscription_id");
  const signature = searchParams.get("razorpay_signature");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!paymentId || !subscriptionId || !signature) {
    return NextResponse.redirect(`${baseUrl}/dashboard?razorpay=missing`);
  }

  const isValid = verifyPaymentSignature(paymentId, subscriptionId, signature);
  if (!isValid) {
    return NextResponse.redirect(`${baseUrl}/dashboard?razorpay=invalid`);
  }

  try {
    const sub = await getRazorpay().subscriptions.fetch(subscriptionId);
    const payload = sub as { plan_id: string; notes?: { user_id?: string }; current_end?: number };
    const userId = payload.notes?.user_id;
    if (!userId) {
      return NextResponse.redirect(`${baseUrl}/dashboard?razorpay=error`);
    }

    const plan = getPlanFromRazorpayPlanId(payload.plan_id);
    const periodEnd = payload.current_end
      ? new Date(payload.current_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { supabaseAdmin } = await import("@/lib/supabase/admin");
    await supabaseAdmin.from("profiles").update({
      plan,
      stripe_customer_id: `rzp_${subscriptionId}`,
    }).eq("id", userId);

    await supabaseAdmin.from("subscriptions").upsert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      plan,
      status: "active",
      current_period_end: periodEnd,
    }, { onConflict: "stripe_subscription_id" });

    return NextResponse.redirect(`${baseUrl}/dashboard?upgraded=true`);
  } catch (error) {
    console.error("Razorpay callback error:", error);
    return NextResponse.redirect(`${baseUrl}/dashboard?razorpay=error`);
  }
}
