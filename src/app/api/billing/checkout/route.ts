import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  createOrRetrieveCustomer,
} from "@/lib/stripe/helpers";
import type { Plan } from "@/types";

const PRICE_IDS: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  "pro-annual": process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  agency: process.env.STRIPE_AGENCY_PRICE_ID,
  "agency-annual": process.env.STRIPE_AGENCY_ANNUAL_PRICE_ID,
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, billing } = (await request.json()) as {
      plan: Plan;
      billing?: "monthly" | "annual";
    };

    const key = billing === "annual" ? `${plan}-annual` : plan;
    const priceId = PRICE_IDS[key];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const customerId = await createOrRetrieveCustomer(user.email!, user.id);

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);

    const session = await createCheckoutSession(customerId, priceId, user.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
