// src/app/dashboard/settings/page.tsx

import { createClient }  from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect }      from "next/navigation";
import { SUPPORT_EMAIL } from "@/config/constants";
import UpgradeSection    from "@/components/dashboard/UpgradeSection";
import { DefaultOutputLanguageSection } from "@/components/dashboard/settings/default-output-language";
import { Crown, Shield, Trash2, CreditCard, CalendarDays, User } from "lucide-react";

const PLAN_CONFIG = {
  free: {
    label:       "Free",
    price:       "₹0/month",
    textClass:   "text-gray-600",
    bgClass:     "bg-gray-50 dark:bg-gray-900/30",
    borderClass: "border-gray-200 dark:border-gray-700",
    badgeClass:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    description: "5 repurposes/mo · 3 platforms · Watermark",
  },
  starter: {
    label:       "Starter",
    price:       "₹299/month",
    textClass:   "text-teal-700 dark:text-teal-400",
    bgClass:     "bg-teal-50 dark:bg-teal-900/20",
    borderClass: "border-teal-200 dark:border-teal-800",
    badgeClass:  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    description: "50 repurposes/mo · All platforms · GPT‑4o‑mini · No watermark",
  },
  pro: {
    label:       "Pro",
    price:       "₹799/month",
    textClass:   "text-blue-700 dark:text-blue-400",
    bgClass:     "bg-blue-50 dark:bg-blue-900/20",
    borderClass: "border-blue-200 dark:border-blue-800",
    badgeClass:  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    description: "150 repurposes/mo · Claude Haiku · 5 brand voices",
  },
  agency: {
    label:       "Agency",
    price:       "₹2,499/month",
    textClass:   "text-violet-700 dark:text-violet-400",
    bgClass:     "bg-violet-50 dark:bg-violet-900/20",
    borderClass: "border-violet-200 dark:border-violet-800",
    badgeClass:  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
    description: "500 repurposes/mo · Claude Sonnet · 15 brand voices",
  },
} as const;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, current_period_end, cancel_at_period_end, stripe_subscription_id")
    .eq("user_id", user.id)
    .single();

  const activePlan = (
    sub?.status === "active" || sub?.status === "trialing"
      ? sub.plan
      : "free"
  ) as keyof typeof PLAN_CONFIG;

  const planConfig = PLAN_CONFIG[activePlan];

  const renewsOn = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const displayName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User";
  const initial = (user.email?.[0] ?? "U").toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const provider = user.app_metadata?.provider ?? "email";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and subscription</p>
      </div>

      {/* Account section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Account
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${planConfig.badgeClass}`}>
              {planConfig.label}
            </span>
          </div>

          <div className="border-t border-border/60 px-5 py-4 grid grid-cols-2 gap-4 bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Member since</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                {memberSince}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Auth provider</p>
              <p className="text-sm font-medium text-foreground capitalize flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                {provider}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 px-5 pb-5 border-t border-border/60 pt-4">
          <DefaultOutputLanguageSection />
        </div>
      </section>

      {/* Subscription section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Subscription
        </h2>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Plan card */}
          <div className={`p-5 ${planConfig.bgClass} border-b ${planConfig.borderClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {activePlan !== "free" && <Crown className={`h-4 w-4 ${planConfig.textClass}`} />}
                  <span className={`text-base font-bold ${planConfig.textClass}`}>
                    {planConfig.label} Plan
                  </span>
                </div>
                <p className={`text-sm opacity-80 ${planConfig.textClass}`}>{planConfig.description}</p>
                {renewsOn && activePlan !== "free" && (
                  <p className={`text-xs opacity-70 ${planConfig.textClass} flex items-center gap-1`}>
                    <CalendarDays className="h-3 w-3" />
                    {sub?.cancel_at_period_end ? `Cancels on ${renewsOn}` : `Renews on ${renewsOn}`}
                  </p>
                )}
              </div>
              <span className={`text-sm font-bold shrink-0 ${planConfig.textClass}`}>
                {planConfig.price}
              </span>
            </div>
          </div>

          <div className="p-5">
            {activePlan === "free" ? (
              <UpgradeSection />
            ) : (
              <ManageBillingButton />
            )}
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-destructive flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Danger zone
        </h2>
        <div className="bg-card border border-destructive/30 rounded-xl p-5">
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Permanently delete your account, all repurpose history, brand voices, and cancel your subscription. This cannot be undone.
          </p>
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}

function ManageBillingButton() {
  return (
    <a
      href={`mailto:${SUPPORT_EMAIL}?subject=Billing%20request`}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-transparent text-foreground text-sm font-medium hover:bg-accent/50 transition-colors"
    >
      <CreditCard className="h-4 w-4" />
      Manage billing
    </a>
  );
}

function DeleteAccountButton() {
  return (
    <a
      href="/dashboard/settings/delete"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 bg-transparent text-destructive text-sm font-medium hover:bg-destructive/5 transition-colors"
    >
      <Trash2 className="h-4 w-4" />
      Delete account
    </a>
  );
}
