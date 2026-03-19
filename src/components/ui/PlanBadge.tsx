"use client";
// src/components/ui/PlanBadge.tsx
// FIX #1: Replace any hardcoded plan badge with this component
// It reads the real plan from the API, not stale user metadata
//
// Usage in your navbar/sidebar/profile dropdown:
//   import { PlanBadge } from "@/components/ui/PlanBadge";
//   <PlanBadge />
//
// This replaces any code like:
//   user.user_metadata?.plan === "pro" ? <span>Pro</span> : null

import { useUserPlan } from "@/hooks/useUserPlan";

const PLAN_STYLES = {
  free: {
    label:      "Free",
    background: "#F3F4F6",
    color:      "#6B7280",
    border:     "#E5E7EB",
  },
  pro: {
    label:      "Pro",
    background: "#EFF6FF",
    color:      "#2563EB",
    border:     "#BFDBFE",
  },
  agency: {
    label:      "Agency",
    background: "#F5F3FF",
    color:      "#7C3AED",
    border:     "#DDD6FE",
  },
};

interface PlanBadgeProps {
  /** Show the free plan badge too (default: false — only shows pro/agency) */
  showFree?: boolean;
  /** Size variant */
  size?: "sm" | "md";
}

export function PlanBadge({ showFree = false, size = "sm" }: PlanBadgeProps) {
  const { plan, loading } = useUserPlan();

  // Don't show anything while loading to avoid flash
  if (loading) return null;

  // Only show badge for paid plans unless showFree is true
  if (plan === "free" && !showFree) return null;

  const style = PLAN_STYLES[plan];

  return (
    <span
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        fontSize:     size === "sm" ? "10px" : "12px",
        fontWeight:   700,
        padding:      size === "sm" ? "2px 7px" : "4px 10px",
        borderRadius: "999px",
        background:   style.background,
        color:        style.color,
        border:       `1px solid ${style.border}`,
        letterSpacing: "0.02em",
        lineHeight:   1,
      }}
    >
      {style.label}
    </span>
  );
}
