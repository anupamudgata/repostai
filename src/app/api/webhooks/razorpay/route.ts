import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPlanFromRazorpayPlanId } from "@/lib/razorpay/helpers";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("X-Razorpay-Signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload?: { subscription?: { entity?: Record<string, unknown> }; payment?: { entity?: Record<string, unknown> } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (event.event === "subscription.activated") {
      const sub = event.payload?.subscription?.entity as {
        id: string;
        plan_id: string;
        notes?: { user_id?: string };
        current_end?: number;
      } | undefined;
      if (sub?.notes?.user_id) {
        const plan = getPlanFromRazorpayPlanId(sub.plan_id);
        const periodEnd = sub.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        await supabaseAdmin.from("profiles").update({
          plan,
          stripe_customer_id: `rzp_${sub.id}`,
        }).eq("id", sub.notes.user_id);

        await supabaseAdmin.from("subscriptions").upsert({
          user_id: sub.notes.user_id,
          stripe_subscription_id: sub.id,
          plan,
          status: "active",
          current_period_end: periodEnd,
        }, { onConflict: "stripe_subscription_id" });
      }
    } else if (event.event === "subscription.cancelled" || event.event === "subscription.completed") {
      const sub = event.payload?.subscription?.entity as { id: string } | undefined;
      if (sub?.id) {
        const { data: row } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (row) {
          await supabaseAdmin.from("profiles").update({ plan: "free" }).eq("id", row.user_id);
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", sub.id);
        }
      }
    }
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
