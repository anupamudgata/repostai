import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";
import { supabaseAdmin }             from "@/lib/supabase/admin";
import { stripe }                    from "@/lib/stripe/config";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { data: userData, error: userError } = await supabaseAdmin
      .from("users").select("stripe_customer_id, email").eq("id", user.id).single();

    if (userError || !userData) return NextResponse.json({ error: "User not found." }, { status: 404 });

    let customerId = userData.stripe_customer_id as string | null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email:    userData.email ?? user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabaseAdmin.from("users").update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() }).eq("id", user.id);
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:   customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?billing=done`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (err) {
    console.error("[portal]", err);
    return NextResponse.json({ error: "Could not open billing portal. Please try again." }, { status: 500 });
  }
}
