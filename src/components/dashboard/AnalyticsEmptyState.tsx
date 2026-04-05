"use client";

import { BarChart3 } from "lucide-react";
import {
  DashboardEmptyState,
  type DashboardEmptyAction,
} from "@/components/dashboard/dashboard-empty-state";

/** Full-page-style analytics empty state; uses the shared dashboard empty layout. */
export function AnalyticsEmptyState({
  metric,
  action,
}: {
  metric?: string;
  action?: DashboardEmptyAction;
}) {
  const resolvedAction: DashboardEmptyAction =
    action ?? { label: "Start repurposing", href: "/dashboard/repurpose" };

  return (
    <DashboardEmptyState
      icon={BarChart3}
      title={metric ? `No ${metric} data yet` : "No analytics yet"}
      description="Repurpose content and connect accounts to track reach and engagement in one place."
      action={resolvedAction}
    />
  );
}
