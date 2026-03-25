"use client";

import Link from "next/link";
import { BillingPortalButton } from "./BillingPortalButton";

interface BillingSectionProps {
  plan: "free" | "starter" | "pro" | "agency";
  status?: string;
  currentPeriodEnd?: string;
}

const PLAN_STYLES: Record<string, { name: string; color: string }> = {
  pro:     { name: "Pro",     color: "text-blue-600 bg-blue-600/10 border-blue-600/30" },
  agency:  { name: "Agency",  color: "text-purple-600 bg-purple-600/10 border-purple-600/30" },
  starter: { name: "Starter", color: "text-teal-600 bg-teal-600/10 border-teal-600/30" },
  free:    { name: "Free",    color: "text-muted-foreground bg-muted border-border" },
};

export function BillingSection({ plan, status, currentPeriodEnd }: BillingSectionProps) {
  const ps = PLAN_STYLES[plan] ?? PLAN_STYLES.free;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2.5">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Billing</h3>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${ps.color}`}>{ps.name}</span>
            {status && status !== "active" && <span className="text-[11px] text-yellow-500">({status})</span>}
          </div>
        </div>
        {plan !== "free" && <BillingPortalButton />}
      </div>
      {plan === "free" && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          You are on the free plan (10 repurposes/month, watermark).{" "}
          <Link href="/#pricing" className="text-primary font-semibold hover:underline">
            Upgrade to Starter or Pro
          </Link>{" "}
          for no watermark and more features.
        </p>
      )}
      {plan !== "free" && currentPeriodEnd && (
        <p className="text-xs text-muted-foreground">Current period ends: {new Date(currentPeriodEnd).toLocaleDateString()}</p>
      )}
    </div>
  );
}
