import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SUPPORT_EMAIL } from "@/config/constants";

/** Razorpay does not provide a hosted billing portal. Returns a message to contact support. */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      message: `To cancel or change your plan, email ${SUPPORT_EMAIL}`,
    });
  } catch (error) {
    console.error("Billing portal error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
