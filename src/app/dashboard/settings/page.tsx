// src/app/dashboard/settings/page.tsx
// FIX #2: Black screen fixed — removed bg-background class that renders black
//         when CSS variables not loaded. Use explicit safe colors.
// FIX #3: Plan badge now reads from subscriptions table (single source of truth)
//         not from user metadata which can be stale.

import { createClient }  from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect }      from "next/navigation";
import { SUPPORT_EMAIL } from "@/config/constants";

// Plan display config
const PLAN_CONFIG = {
  free: {
    label:       "Free",
    price:       "$0/month",
    color:       "#6B7280",
    bg:          "#F9FAFB",
    border:      "#E5E7EB",
    description: "5 repurposes per month",
  },
  pro: {
    label:       "Pro",
    price:       "$19/month",
    color:       "#2563EB",
    bg:          "#EFF6FF",
    border:      "#BFDBFE",
    description: "Unlimited repurposes · All platforms · Brand voice",
  },
  agency: {
    label:       "Agency",
    price:       "$49/month",
    color:       "#7C3AED",
    bg:          "#F5F3FF",
    border:      "#DDD6FE",
    description: "Everything in Pro · 10 brand voices · CSV export",
  },
} as const;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // FIX #3: Always read plan from subscriptions table — single source of truth
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end, stripe_subscription_id")
    .eq("user_id", user.id)
    .single();

  // Determine actual plan — only "active" or "trialing" subscriptions count
  const activePlan = (
    sub?.status === "active" || sub?.status === "trialing"
      ? sub.plan
      : "free"
  ) as "free" | "pro" | "agency";

  const planConfig = PLAN_CONFIG[activePlan];

  const renewsOn = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    // FIX #2: Use explicit white background — NOT bg-background which goes black
    <div style={{
      minHeight:   "100vh",
      background:  "#F9FAFB",   // explicit safe color, not CSS variable
      padding:     "40px 24px",
      fontFamily:  "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Page title */}
        <h1 style={{
          fontSize:     "22px",
          fontWeight:   700,
          color:        "#111827",   // explicit — not text-foreground
          marginBottom: "32px",
        }}>
          Settings
        </h1>

        {/* ── Account section ─────────────────────────────────────── */}
        <section style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "12px" }}>
            Account
          </h2>
          <div style={{
            background:   "#FFFFFF",
            border:       "1px solid #E5E7EB",
            borderRadius: "12px",
            padding:      "20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              {/* Avatar */}
              <div style={{
                width:          "48px",
                height:         "48px",
                borderRadius:   "50%",
                background:     "#1E3A5F",
                color:          "#FFFFFF",
                fontSize:       "18px",
                fontWeight:     700,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                flexShrink:     0,
              }}>
                {user.email?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: 0 }}>
                  {user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"}
                </p>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: "2px 0 0" }}>
                  {user.email}
                </p>
              </div>
              {/* FIX #3: Plan badge reads from subscriptions table */}
              <span style={{
                marginLeft:   "auto",
                fontSize:     "12px",
                fontWeight:   600,
                padding:      "4px 12px",
                borderRadius: "999px",
                background:   planConfig.bg,
                color:        planConfig.color,
                border:       `1px solid ${planConfig.border}`,
              }}>
                {planConfig.label}
              </span>
            </div>

            <div style={{ borderTop: "0.5px solid #F3F4F6", paddingTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#9CA3AF" }}>Member since</span>
                  <p style={{ color: "#374151", fontWeight: 500, margin: "2px 0 0" }}>
                    {new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <span style={{ color: "#9CA3AF" }}>Auth provider</span>
                  <p style={{ color: "#374151", fontWeight: 500, margin: "2px 0 0", textTransform: "capitalize" }}>
                    {user.app_metadata?.provider ?? "email"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Subscription section ─────────────────────────────────── */}
        <section style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "12px" }}>
            Subscription
          </h2>
          <div style={{
            background:   "#FFFFFF",
            border:       "1px solid #E5E7EB",
            borderRadius: "12px",
            overflow:     "hidden",
          }}>
            {/* Plan card */}
            <div style={{
              padding:    "20px",
              background: planConfig.bg,
              borderBottom: `1px solid ${planConfig.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: planConfig.color }}>
                  {planConfig.label} plan
                </span>
                <span style={{ fontSize: "15px", fontWeight: 600, color: planConfig.color }}>
                  {planConfig.price}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: planConfig.color, opacity: 0.8, margin: 0 }}>
                {planConfig.description}
              </p>
              {renewsOn && activePlan !== "free" && (
                <p style={{ fontSize: "12px", color: planConfig.color, opacity: 0.7, marginTop: "8px" }}>
                  {sub?.cancel_at_period_end
                    ? `Cancels on ${renewsOn}`
                    : `Renews on ${renewsOn}`}
                </p>
              )}
            </div>

            <div style={{ padding: "16px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {activePlan === "free" ? (
                <a
                  href="/pricing"
                  style={{
                    padding:      "9px 20px",
                    borderRadius: "8px",
                    background:   "#2563EB",
                    color:        "#FFFFFF",
                    fontSize:     "13px",
                    fontWeight:   600,
                    textDecoration: "none",
                  }}
                >
                  Upgrade to Pro — $19/mo
                </a>
              ) : (
                <ManageBillingButton />
              )}
            </div>
          </div>
        </section>

        {/* ── Danger zone ──────────────────────────────────────────── */}
        <section>
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#DC2626", marginBottom: "12px" }}>
            Danger zone
          </h2>
          <div style={{
            background:   "#FFFFFF",
            border:       "1px solid #FECACA",
            borderRadius: "12px",
            padding:      "20px",
          }}>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "16px", lineHeight: 1.6 }}>
              Permanently delete your account, all repurpose history, brand voices, and cancel
              your subscription. This cannot be undone.
            </p>
            <DeleteAccountButton />
          </div>
        </section>

      </div>
    </div>
  );
}

// ── Client components (inline to avoid extra files) ───────────────────────────

function ManageBillingButton() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}?subject=Billing%20request`}
      style={{
        display:        "inline-flex",
        padding:        "9px 20px",
        borderRadius:   "8px",
        border:         "1px solid #E5E7EB",
        background:     "transparent",
        color:          "#374151",
        fontSize:       "13px",
        fontWeight:     600,
        cursor:         "pointer",
        textDecoration: "none",
      }}
    >
      Manage billing
    </a>
  );
}

function DeleteAccountButton() {
  return (
    <a
      href="/dashboard/settings/delete"
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            "6px",
        padding:        "8px 16px",
        borderRadius:   "8px",
        border:         "1px solid #FECACA",
        background:     "transparent",
        color:          "#DC2626",
        fontSize:       "13px",
        fontWeight:     500,
        textDecoration: "none",
      }}
    >
      Delete account
    </a>
  );
}
