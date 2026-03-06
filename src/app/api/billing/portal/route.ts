import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBillingPortalSession } from "@/lib/stripe/helpers";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found. Please subscribe to a plan first." },
        { status: 400 }
      );
    }

    const session = await createBillingPortalSession(
      profile.stripe_customer_id
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
