"use client";
// src/hooks/useUserPlan.ts
import { useState, useEffect } from "react";
import type { Plan } from "@/types";

export type { Plan };

interface UserPlanState {
  plan:    Plan;
  loading: boolean;
  error:   string | null;
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
        const data = await res.json() as { plan?: Plan };

        if (!cancelled) {
          setState({
            plan:    data.plan ?? "free",
            loading: false,
            error:   null,
          });
        }
      } catch {
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
