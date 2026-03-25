"use client";

import { useState, useEffect, useCallback } from "react";

type CheckoutPlan = "starter" | "pro" | "agency";
type BillingCycle = "monthly" | "annual";

interface RazorpayCheckoutProps {
  plan: CheckoutPlan;
  billing: BillingCycle;
  onSuccess?: () => void;
  onError?: (reason?: string) => void;
  children?: React.ReactNode;
  className?: string;
}

interface RazorpayOptions {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpayPaymentResponse) => void;
  modal: { ondismiss: () => void };
  theme: { color: string };
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const PLAN_LABELS: Record<CheckoutPlan, string> = {
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({
  plan,
  billing,
  onSuccess,
  onError,
  children,
  className,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadRazorpayScript()
      .then(() => setScriptReady(true))
      .catch(() => onError?.("Failed to load payment SDK"));
  }, [onError]);

  const openCheckout = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!scriptReady) {
        await loadRazorpayScript();
        setScriptReady(true);
      }

      const res = await fetch("/api/billing/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error (${res.status})`);
      }

      const { subscriptionId, keyId } = (await res.json()) as {
        subscriptionId: string;
        keyId: string;
      };

      const billingLabel = billing === "annual" ? "Annual" : "Monthly";

      const options: RazorpayOptions = {
        key: keyId,
        subscription_id: subscriptionId,
        name: "RepostAI",
        description: `${PLAN_LABELS[plan]} — ${billingLabel}`,
        handler(response: RazorpayPaymentResponse) {
          const params = new URLSearchParams({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          });
          window.location.href = `/api/billing/razorpay/callback?${params.toString()}`;
          onSuccess?.();
        },
        modal: {
          ondismiss() {
            onError?.("Payment cancelled");
          },
        },
        theme: { color: "#2563EB" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  }, [plan, billing, loading, scriptReady, onSuccess, onError]);

  if (children) {
    return (
      <button
        type="button"
        onClick={openCheckout}
        disabled={loading}
        className={className}
        style={{ cursor: loading ? "wait" : "pointer" }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openCheckout}
      disabled={loading}
      className={className}
      style={{
        padding: "10px 24px",
        borderRadius: "8px",
        background: "#2563EB",
        color: "#FFFFFF",
        fontSize: "14px",
        fontWeight: 600,
        border: "none",
        cursor: loading ? "wait" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "opacity 150ms",
      }}
    >
      {loading ? "Processing…" : `Subscribe to ${PLAN_LABELS[plan]}`}
    </button>
  );
}
