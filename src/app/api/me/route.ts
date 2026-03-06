import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { FREE_TIER_MONTHLY_LIMIT } from "@/config/constants";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "free";
  const isFree = plan === "free";

  let repurposeCount = 0;
  if (isFree) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("usage")
      .select("repurpose_count")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .single();
    repurposeCount = usage?.repurpose_count ?? 0;
  }

  return NextResponse.json({
    plan,
    repurposeCount: isFree ? repurposeCount : null,
    repurposeLimit: isFree ? FREE_TIER_MONTHLY_LIMIT : null,
  });
}
