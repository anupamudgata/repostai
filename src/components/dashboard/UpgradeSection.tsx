"use client";

import { useState } from "react";
import RazorpayCheckout from "@/components/checkout/RazorpayCheckout";

type CheckoutPlan = "starter" | "pro" | "agency";
type BillingCycle = "monthly" | "annual";

const UPGRADE_PLANS = [
  {
    id: "starter" as CheckoutPlan,
    label: "Starter",
    monthlyPrice: "₹199",
    annualPrice: "₹1,899",
    color: "#0D9488",
    bg: "#F0FDFA",
    border: "#99F6E4",
    description: "10 repurposes · All platforms · No watermark",
  },
  {
    id: "pro" as CheckoutPlan,
    label: "Pro",
    monthlyPrice: "₹499",
    annualPrice: "₹4,999",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    popular: true,
    description: "60 repurposes · Claude AI · 3 brand voices",
  },
  {
    id: "agency" as CheckoutPlan,
    label: "Agency",
    monthlyPrice: "₹1,499",
    annualPrice: "₹14,999",
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    description: "Unlimited · 5 brand voices · Team & API",
  },
] as const;

export default function UpgradeSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {/* Billing toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#6B7280",
          }}
        >
          Billing:
        </span>
        <div
          style={{
            display: "inline-flex",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
          }}
        >
          {(["monthly", "annual"] as BillingCycle[]).map((cycle) => (
            <button
              key={cycle}
              type="button"
              onClick={() => setBilling(cycle)}
              style={{
                padding: "5px 14px",
                fontSize: "12px",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                background: billing === cycle ? "#2563EB" : "transparent",
                color: billing === cycle ? "#FFFFFF" : "#6B7280",
                transition: "all 150ms",
              }}
            >
              {cycle === "monthly" ? "Monthly" : "Annual (save ~20%)"}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {UPGRADE_PLANS.map((plan) => (
          <RazorpayCheckout
            key={plan.id}
            plan={plan.id}
            billing={billing}
            onError={(reason) => setError(reason ?? "Payment failed")}
            className=""
          >
            <div
              style={{
                padding: "14px 12px",
                borderRadius: "10px",
                border: `1.5px solid ${plan.border}`,
                background: plan.bg,
                textAlign: "center",
                transition: "all 150ms",
                position: "relative",
              }}
            >
              {"popular" in plan && plan.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "999px",
                    background: plan.color,
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                  }}
                >
                  Popular
                </span>
              )}
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: plan.color,
                  margin: "0 0 2px",
                }}
              >
                {plan.label}
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: plan.color,
                  margin: "0 0 4px",
                }}
              >
                {billing === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                <span style={{ fontSize: "11px", fontWeight: 500, opacity: 0.8 }}>
                  /{billing === "monthly" ? "mo" : "yr"}
                </span>
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: plan.color,
                  opacity: 0.75,
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {plan.description}
              </p>
            </div>
          </RazorpayCheckout>
        ))}
      </div>

      {error && (
        <p style={{ fontSize: "12px", color: "#DC2626", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
