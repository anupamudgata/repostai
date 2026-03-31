"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";

export function WorkspaceHeader({
  d,
  df,
  usage,
  loading,
  generateDisabled,
  onGenerate,
  bulkMode,
  inputType,
  bulkUrlCount,
  selectedPlatformCount,
}: {
  d: DashboardBulk;
  df: (template: string, vars: Record<string, string | number>) => string;
  usage: { count: number; limit: number | null; daysUntilReset: number } | null;
  loading: boolean;
  generateDisabled: boolean;
  onGenerate: () => void;
  bulkMode: boolean;
  inputType: string;
  bulkUrlCount: number;
  selectedPlatformCount: number;
}) {
  const usageRatio = usage?.limit != null ? usage.count / usage.limit : 0;
  const usageBarClass =
    usageRatio >= 0.9 ? "usage-bar-fill danger" : usageRatio >= 0.7 ? "usage-bar-fill warn" : "usage-bar-fill";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/50 pb-6">
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {d.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          {d.subtitle}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:items-end shrink-0 w-full sm:w-auto">
        {usage && (
          <div className="w-full sm:min-w-[220px] rounded-xl border border-border/60 bg-card/80 px-3 py-2.5 text-xs space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-foreground/70">
                {usage.limit != null
                  ? df(d.usageLine, { count: usage.count, limit: usage.limit })
                  : df(d.usageLineUnlimited, { count: usage.count })}
              </p>
              {usage.limit != null && (
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {Math.round(usageRatio * 100)}%
                </span>
              )}
            </div>
            {usage.limit != null && (
              <div className="h-1.5 rounded-full bg-muted/80 overflow-hidden">
                <div
                  className={usageBarClass}
                  style={{ width: `${Math.min(100, usageRatio * 100)}%` }}
                />
              </div>
            )}
            <p className="text-muted-foreground/70">
              {df(d.resetsInDays, { days: usage.daysUntilReset })}
            </p>
          </div>
        )}
        <Button
          size="lg"
          className="btn-generate w-full sm:w-auto min-h-12 font-semibold border-0 px-6"
          onClick={onGenerate}
          disabled={loading || generateDisabled}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
              {inputType === "url" && bulkMode
                ? df(d.generatingBulk, {
                    sources: bulkUrlCount,
                    platforms: selectedPlatformCount,
                  })
                : df(d.generatingSingle, { platforms: selectedPlatformCount })}
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
              {inputType === "url" && bulkMode
                ? df(d.repurposeBulk, { platforms: selectedPlatformCount })
                : df(d.repurposeSingle, { platforms: selectedPlatformCount })}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground/70 text-center sm:text-right max-w-[280px] leading-relaxed">
          {generateDisabled && !loading
            ? d.generateCtaHelperDisabled
            : d.generateCtaHelper}
        </p>
        {usage?.limit != null && usage.count >= Math.max(0, usage.limit - 2) && (
          <Link
            href="/#pricing"
            className="text-xs font-semibold text-primary hover:underline text-center sm:text-right"
          >
            {d.upgrade} →
          </Link>
        )}
      </div>
    </header>
  );
}
