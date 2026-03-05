import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { getPlanFromPriceId } from "@/lib/stripe/helpers";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role for webhook — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

        await supabaseAdmin
          .from("profiles")
          .update({
            plan,
            stripe_customer_id: session.customer as string,
          })
          .eq("id", userId);

        await supabaseAdmin.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          plan,
          status: subscription.status,
          current_period_end: new Date(periodEnd * 1000).toISOString(),
        });

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);
        const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end;

        await supabaseAdmin
          .from("subscriptions")
          .update({
            plan,
            status: subscription.status,
            current_period_end: new Date(periodEnd * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        // Also update the profile plan
        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan })
            .eq("id", sub.user_id);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { data: sub } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        if (sub) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "free" })
            .eq("id", sub.user_id);

          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", subscription.id);
        }

        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
