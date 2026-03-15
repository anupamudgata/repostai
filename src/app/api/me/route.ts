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

  const SUPERUSER_EMAIL = "anupam.udgata@gmail.com";
  const isSuperUser = user.email === SUPERUSER_EMAIL;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, zapier_webhook_url")
    .eq("id", user.id)
    .single();

  const plan = isSuperUser ? "pro" : profile?.plan || "free";
  const isFree = !isSuperUser && plan === "free";

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
    isSuperUser,
    zapier_webhook_url: profile?.zapier_webhook_url ?? null,
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { zapier_webhook_url?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const url = body.zapier_webhook_url;
  if (url !== undefined) {
    const toSet = url === null || url === "" ? null : String(url).trim();
    if (toSet !== null && (!toSet.startsWith("https://") || toSet.length > 500)) {
      return NextResponse.json(
        { error: "Zapier webhook URL must be a valid HTTPS URL (max 500 characters)" },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from("profiles")
      .update({ zapier_webhook_url: toSet })
      .eq("id", user.id);
    if (error) {
      return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
