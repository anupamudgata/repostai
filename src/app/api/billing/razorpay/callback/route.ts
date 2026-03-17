import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRazorpay } from "@/lib/razorpay/client";
import { verifyPaymentSignature, getPlanFromRazorpayPlanId } from "@/lib/razorpay/helpers";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("placeholder") || key === "placeholder") {
    throw new Error("Supabase not configured");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

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

    const supabaseAdmin = getSupabaseAdmin();
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
