import { stripe } from "./client";
import type { Plan } from "@/types";

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    metadata: { userId },
  });
}

export async function createOrRetrieveCustomer(
  email: string,
  userId: string
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });

  if (existing.data.length > 0) {
    return existing.data[0].id;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  return customer.id;
}

export async function createBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });
}

export function getPlanFromPriceId(priceId: string): Plan {
  const proPriceIds = [
    process.env.STRIPE_PRO_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ];
  const agencyPriceIds = [
    process.env.STRIPE_AGENCY_PRICE_ID,
    process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID,
  ];

  if (proPriceIds.includes(priceId)) return "pro";
  if (agencyPriceIds.includes(priceId)) return "agency";
  return "free";
}
