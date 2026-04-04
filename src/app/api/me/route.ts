import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  daysUntilUsageReset,
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";
import {
  getOrCreateUserProfile,
  updateProfileZapierUrlAdmin,
} from "@/lib/supabase/ensure-profile";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileResult = await getOrCreateUserProfile(user, supabase);
    if (!profileResult.ok) {
      if (profileResult.kind === "config") {
        return NextResponse.json(
          { error: profileResult.message, code: "SUPABASE_CONFIG" },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error: "Could not load your profile. Try again or refresh the page.",
          code: "PROFILE_SYNC_FAILED",
          hint:
            "Check Vercel: SUPABASE_SERVICE_ROLE_KEY (service_role JWT) and NEXT_PUBLIC_SUPABASE_URL match the same Supabase project. In SQL Editor run scripts/supabase-paste-full-profile-fix.sql or SUPABASE_SCHEMA_FINAL.sql.",
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("photos_uploaded_this_month, photos_usage_month")
      .eq("id", user.id)
      .maybeSingle();

    const monthKey = currentMonth;
    const photoCount =
      profile?.photos_usage_month === monthKey
        ? (profile?.photos_uploaded_this_month ?? 0)
        : 0;
    const photoLimit = isSuperUser ? null : (entitlements.photosPerMonth ?? 0);

    return NextResponse.json({
      plan,
      repurposeCount,
      repurposeLimit,
      photoCount,
      photoLimit,
      daysUntilUsageReset: daysUntilUsageReset(),
      isSuperUser,
      zapier_webhook_url: profileResult.zapier_webhook_url,
      profileReady: true,
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
        const adminUp = await updateProfileZapierUrlAdmin(user.id, toSet);
        if (!adminUp.ok) {
          console.error("[me] PATCH profile update", error.message, adminUp.error);
          return NextResponse.json({ error: "Could not update profile" }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[me] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
