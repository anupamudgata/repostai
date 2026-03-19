// src/app/api/user/plan/route.ts
// FIX #1: Returns the real plan from the subscriptions table
// This is what the navbar/profile dropdown should call — not user.user_metadata

import { NextResponse }  from "next/server";
import { createClient }  from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ plan: "free" }, { status: 200 });
    }

    // Read from subscriptions table — single source of truth
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();

    // Only count active or trialing subscriptions
    const activePlan =
      sub?.status === "active" || sub?.status === "trialing"
        ? (sub.plan as string)
        : "free";

    return NextResponse.json({ plan: activePlan });
  } catch {
    return NextResponse.json({ plan: "free" });
  }
}
