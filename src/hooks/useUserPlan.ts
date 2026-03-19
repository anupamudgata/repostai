"use client";
// src/hooks/useUserPlan.ts
// FIX #1: Single source of truth for the user's plan
// The nav bar was reading plan from user metadata (stale) instead of the subscriptions table
// Import this hook in your navbar/sidebar/profile dropdown instead of reading user.user_metadata.plan

import { useState, useEffect } from "react";

export type Plan = "free" | "pro" | "agency";

interface UserPlanState {
  plan:      Plan;
  loading:   boolean;
  error:     string | null;
}

export function useUserPlan(): UserPlanState {
  const [state, setState] = useState<UserPlanState>({
    plan:    "free",
    loading: true,
    error:   null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchPlan() {
      try {
        const res  = await fetch("/api/user/plan");
        const data = await res.json();

        if (!cancelled) {
          setState({
            plan:    (data.plan as Plan) ?? "free",
            loading: false,
            error:   null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ plan: "free", loading: false, error: "Failed to load plan" });
        }
      }
    }

    fetchPlan();
    return () => { cancelled = true; };
  }, []);

  return state;
}
