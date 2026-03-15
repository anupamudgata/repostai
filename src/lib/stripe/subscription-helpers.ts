import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe, STRIPE_PLANS } from "@/lib/stripe/config";
import { sendUpgradeEmail } from "@/lib/email/send";

export function getPlanFromSubscription(
  subscription: Stripe.Subscription
): "free" | "pro" | "agency" {
  const priceId = subscription.items.data[0]?.price.id;
  return STRIPE_PLANS[priceId] ?? "free";
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {
  if (session.mode !== "subscription") return;

  const customerId     = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userEmail      = session.customer_email ?? session.customer_details?.email;

  if (!userEmail) {
    console.error("[webhook] No email found in checkout session", session.id);
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const plan         = getPlanFromSubscription(subscription);

  const { data: userData, error: userError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", userEmail)
    .single();

  if (userError || !userData) {
    console.error("[webhook] User not found for email:", userEmail);
    return;
  }

  const userId = userData.id;
  const item = subscription.items.data[0];

  const { error: subError } = await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        user_id:                userId,
        stripe_customer_id:     customerId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id:        item?.price.id,
        plan,
        status:                 subscription.status,
        current_period_start:   item?.current_period_start ? new Date(item.current_period_start * 1000).toISOString() : new Date().toISOString(),
        current_period_end:     item?.current_period_end   ? new Date(item.current_period_end   * 1000).toISOString() : new Date().toISOString(),
        cancel_at_period_end:   subscription.cancel_at_period_end,
        updated_at:             new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (subError) {
    console.error("[webhook] Failed to upsert subscription:", subError);
    return;
  }

  await supabaseAdmin
    .from("profiles")
    .update({ stripe_customer_id: customerId, plan, updated_at: new Date().toISOString() })
    .eq("id", userId);

  const firstName = session.customer_details?.name?.split(" ")[0] ?? "there";
  if (plan !== "free") {
    sendUpgradeEmail({ email: userEmail, firstName, plan }).catch(console.error);
  }

  console.log(`[webhook] ✓ Checkout completed — ${userEmail} → ${plan}`);
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const plan       = getPlanFromSubscription(subscription);
  const customerId = subscription.customer as string;

  const { data: userData, error: userError } = await supabaseAdmin
    .from("profiles").select("id").eq("stripe_customer_id", customerId).single();

  if (userError || !userData) {
    console.error("[webhook] User not found for customer:", customerId);
    return;
  }

  const item = subscription.items.data[0];

  await supabaseAdmin
    .from("subscriptions")
    .update({
      stripe_price_id:      item?.price.id,
      plan,
      status:               subscription.status,
      current_period_start: item?.current_period_start ? new Date(item.current_period_start * 1000).toISOString() : undefined,
      current_period_end:   item?.current_period_end   ? new Date(item.current_period_end   * 1000).toISOString() : undefined,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at:           new Date().toISOString(),
    })
    .eq("user_id", userData.id);

  await supabaseAdmin
    .from("profiles")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", userData.id);

  console.log(`[webhook] ✓ Subscription updated — customer ${customerId} → ${plan}`);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { data: userData } = await supabaseAdmin
    .from("profiles").select("id").eq("stripe_customer_id", customerId).single();

  if (!userData) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ plan: "free", status: "canceled", cancel_at_period_end: false, updated_at: new Date().toISOString() })
    .eq("user_id", userData.id);

  await supabaseAdmin
    .from("profiles")
    .update({ plan: "free", updated_at: new Date().toISOString() })
    .eq("id", userData.id);

  console.log(`[webhook] ✓ Subscription cancelled — customer ${customerId} → free`);
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const { data: userData } = await supabaseAdmin
    .from("profiles").select("id, email").eq("stripe_customer_id", customerId).single();

  if (!userData) return;

  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "past_due", updated_at: new Date().toISOString() })
    .eq("user_id", userData.id);

  console.log(`[webhook] ⚠ Payment failed — ${userData.email} marked as past_due`);
}
