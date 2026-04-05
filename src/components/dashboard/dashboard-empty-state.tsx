"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DashboardEmptyAction =
  | { label: string; href: string }
  | { label: string; onClick: () => void };

type DashboardEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action: DashboardEmptyAction;
  className?: string;
  variant?: "default" | "compact";
};

export function DashboardEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: DashboardEmptyStateProps) {
  const compact = variant === "compact";

  return (
    <div
      className={cn(
        "text-center",
        compact
          ? "flex h-full min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6"
          : "rounded-xl border border-dashed border-primary/20 bg-primary/3 px-6 py-12",
        className
      )}
    >
      <div
        className={cn(
          "mx-auto flex shrink-0 items-center justify-center",
          compact
            ? "mb-3 h-10 w-10 rounded-lg bg-primary/10"
            : "mb-4 h-10 w-10 rounded-full icon-gradient-purple"
        )}
      >
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </div>
      <h2
        className={cn("font-semibold text-foreground", compact ? "text-sm" : "text-base")}
      >
        {title}
      </h2>
      <p
        className={cn(
          "mx-auto mt-1 max-w-sm text-muted-foreground",
          compact ? "text-xs leading-snug" : "text-sm"
        )}
      >
        {description}
      </p>
      <div className={cn(compact ? "mt-4" : "mt-5")}>
        {"href" in action ? (
          <Button asChild size={compact ? "sm" : "default"}>
            {action.href.startsWith("/api/") ? (
              <a href={action.href}>{action.label}</a>
            ) : (
              <Link href={action.href}>{action.label}</Link>
            )}
          </Button>
        ) : (
          <Button type="button" size={compact ? "sm" : "default"} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
