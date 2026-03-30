import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  daysUntilUsageReset,
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureProfileForUser(user, supabase);

    let profile: { zapier_webhook_url: string | null } | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await supabase
        .from("profiles")
        .select("zapier_webhook_url")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        console.error("[me] profile query error", {
          userId: user.id,
          attempt,
          code: error.code,
          message: error.message,
        });
        if (attempt === 0) await ensureProfileForUser(user, supabase);
        continue;
      }
      if (data) {
        profile = data;
        break;
      }
      console.warn("[me] no profile row for user", { userId: user.id, attempt });
      if (attempt === 0) await ensureProfileForUser(user, supabase);
    }
    if (!profile) {
      console.error("[me] profile still missing after ensure+retry", {
        userId: user.id,
      });
      return NextResponse.json(
        {
          error: "Could not load your profile. Try again or refresh the page.",
          code: "PROFILE_SYNC_FAILED",
          ...(process.env.NODE_ENV === "development" && {
            debug: { userId: user.id },
          }),
        },
        { status: 503 }
      );
    }

    const { plan, isSuperUser } = await getEffectivePlan(
      supabase,
      user.id,
      user.email
    );
    const entitlements = getEntitlements(plan);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const { data: usage } = await supabase
      .from("usage")
      .select("repurpose_count")
      .eq("user_id", user.id)
      .eq("month", currentMonth)
      .maybeSingle();
    const repurposeCount = usage?.repurpose_count ?? 0;

    const repurposeLimit = isSuperUser
      ? null
      : entitlements.repurposesPerMonth;

    return NextResponse.json({
      plan,
      repurposeCount,
      repurposeLimit,
      daysUntilUsageReset: daysUntilUsageReset(),
      isSuperUser,
      zapier_webhook_url: profile?.zapier_webhook_url ?? null,
    });
  } catch (err) {
    console.error("[me] Error:", err);
    return NextResponse.json({ error: "Failed to load user data" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
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
  } catch (err) {
    console.error("[me] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
