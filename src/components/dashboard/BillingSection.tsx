"use client";

import { BillingPortalButton } from "./BillingPortalButton";

interface BillingSectionProps {
  plan: "free" | "starter" | "pro" | "agency";
  status?: string;
  currentPeriodEnd?: string;
}

export function BillingSection({ plan, status, currentPeriodEnd }: BillingSectionProps) {
  const planName =
    plan === "pro"
      ? "Pro"
      : plan === "agency"
        ? "Agency"
        : plan === "starter"
          ? "Starter"
          : "Free";
  const planColor =
    plan === "pro"
      ? "#2563EB"
      : plan === "agency"
        ? "#7C3AED"
        : plan === "starter"
          ? "#0D9488"
          : "#6B7280";

  return (
    <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>Billing</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: planColor, background: `${planColor}10`, padding: "2px 10px", borderRadius: "999px", border: `1px solid ${planColor}30` }}>{planName}</span>
            {status && status !== "active" && <span style={{ fontSize: "11px", color: "#F59E0B" }}>({status})</span>}
          </div>
        </div>
        {plan !== "free" && <BillingPortalButton />}
      </div>
      {plan === "free" && (
        <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6 }}>
          You are on the free plan (10 repurposes/month, watermark).{" "}
          <a href="/#pricing" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
            Upgrade to Starter or Pro
          </a>{" "}
          for no watermark and more features.
        </p>
      )}
      {plan !== "free" && currentPeriodEnd && (
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>Current period ends: {new Date(currentPeriodEnd).toLocaleDateString()}</p>
      )}
    </div>
  );
}
