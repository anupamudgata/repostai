"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RazorpayCheckout from "@/components/checkout/RazorpayCheckout";

type CheckoutPlan = "starter" | "pro" | "agency";
type BillingCycle = "monthly" | "annual";

const PLAN_KEYS = ["FREE", "STARTER", "PRO", "AGENCY"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

const PAID_PLAN_MAP: Partial<Record<PlanKey, CheckoutPlan>> = {
  STARTER: "starter",
  PRO: "pro",
  AGENCY: "agency",
};

interface PricingCTAProps {
  planKey: PlanKey;
  popular: boolean;
}

export function PricingCTA({ planKey, popular }: PricingCTAProps) {
  const router = useRouter();
  const [billing] = useState<BillingCycle>("monthly");
  const [error, setError] = useState<string | null>(null);

  const paidPlan = PAID_PLAN_MAP[planKey];
  const label = planKey === "FREE" ? "Get Started Free" : `Start with ${planKey.charAt(0) + planKey.slice(1).toLowerCase()}`;

  const btnClass = `mt-8 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
    popular
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-input bg-background hover:bg-muted"
  }`;

  if (!paidPlan) {
    return (
      <a href="/sign-up" className={btnClass}>
        {label}
      </a>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}
      <RazorpayCheckout
        plan={paidPlan}
        billing={billing}
        onSuccess={() => router.push("/dashboard?upgraded=true")}
        onError={(reason) => {
          if (reason && reason !== "Payment cancelled") {
            setError(reason);
          }
        }}
        className={btnClass}
      >
        {label}
      </RazorpayCheckout>
    </div>
  );
}

export function BillingToggle({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (v: BillingCycle) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={`font-medium transition-colors ${value === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value === "annual" ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value === "annual" ? "translate-x-6" : "translate-x-1"}`} />
      </button>
      <button
        type="button"
        onClick={() => onChange("annual")}
        className={`font-medium transition-colors ${value === "annual" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Annual
        <span className="ml-1.5 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
          Save 20%
        </span>
      </button>
    </div>
  );
}
