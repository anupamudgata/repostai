import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/billing/plan-entitlements";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ plan: "free" }, { status: 200 });
    }

    const { plan } = await getEffectivePlan(supabase, user.id, user.email);
    return NextResponse.json({ plan });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}
