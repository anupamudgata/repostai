"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";

const REPURPOSE_LOADING_MESSAGES = [
  "Analyzing content...",
  "Building your posts...",
  "Almost ready...",
] as const;

function getShortcutHint(): string {
  if (typeof navigator === "undefined") return "Ctrl+↵";
  return /Mac|iPhone|iPod|iPad/i.test(navigator.platform || navigator.userAgent || "")
    ? "⌘↵"
    : "Ctrl+↵";
}

type GenerateButtonProps = {
  loading: boolean;
  loadingMessageIndex: number;
  disabled: boolean;
  onGenerate: () => void;
  shortcutHint: string;
  d: DashboardBulk;
  df: (template: string, vars: Record<string, string | number>) => string;
  inputType: string;
  bulkMode: boolean;
  selectedPlatformCount: number;
  className?: string;
};

function RepurposeGenerateButton({
  loading,
  loadingMessageIndex,
  disabled,
  onGenerate,
  shortcutHint,
  d,
  df,
  inputType,
  bulkMode,
  selectedPlatformCount,
  className,
}: GenerateButtonProps) {
  return (
    <Button size="lg" className={className} onClick={onGenerate} disabled={disabled}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin shrink-0" />
          <span className="truncate">{REPURPOSE_LOADING_MESSAGES[loadingMessageIndex]}</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">
              {inputType === "url" && bulkMode
                ? df(d.repurposeBulk, { platforms: selectedPlatformCount })
                : df(d.repurposeSingle, { platforms: selectedPlatformCount })}
            </span>
            <span className="hidden md:inline shrink-0 text-[11px] font-normal opacity-80 tabular-nums" aria-hidden>
              {shortcutHint}
            </span>
          </span>
        </>
      )}
    </Button>
  );
}

export function WorkspaceHeader({
  d,
  df,
  usage,
  loading,
  generateDisabled,
  onGenerate,
  bulkMode,
  inputType,
  selectedPlatformCount,
  headerAccessory,
}: {
  d: DashboardBulk;
  df: (template: string, vars: Record<string, string | number>) => string;
  usage: { count: number; limit: number | null; daysUntilReset: number } | null;
  loading: boolean;
  generateDisabled: boolean;
  onGenerate: () => void;
  bulkMode: boolean;
  inputType: string;
  bulkUrlCount?: number;
  selectedPlatformCount: number;
  /** e.g. keyboard shortcuts popover trigger */
  headerAccessory?: ReactNode;
}) {
  const usageRatio = usage?.limit != null ? usage.count / usage.limit : 0;
  const usageBarClass =
    usageRatio >= 0.9 ? "usage-bar-fill danger" : usageRatio >= 0.7 ? "usage-bar-fill warn" : "usage-bar-fill";

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [shortcutHint] = useState(getShortcutHint);
  const generateDisabledState = loading || generateDisabled;

  useEffect(() => {
    if (!loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingMessageIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setLoadingMessageIndex((i) => (i + 1) % REPURPOSE_LOADING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [loading]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || (!e.metaKey && !e.ctrlKey)) return;
      if (generateDisabledState) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("[data-slot='dialog-content']") || el?.closest?.('[role="dialog"]')) return;
      e.preventDefault();
      onGenerate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [generateDisabledState, onGenerate]);

  const btnProps: GenerateButtonProps = {
    loading,
    loadingMessageIndex,
    disabled: generateDisabledState,
    onGenerate,
    shortcutHint,
    d,
    df,
    inputType,
    bulkMode,
    selectedPlatformCount,
  };

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-border/50 pb-6">
        <div className="min-w-0 space-y-1.5 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{d.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{d.subtitle}</p>
            </div>
            {headerAccessory ? (
              <div className="shrink-0 pt-0.5">{headerAccessory}</div>
            ) : null}
          </div>
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
                  <div className={usageBarClass} style={{ width: `${Math.min(100, usageRatio * 100)}%` }} />
                </div>
              )}
              <p className="text-muted-foreground/70">{df(d.resetsInDays, { days: usage.daysUntilReset })}</p>
            </div>
          )}
          <RepurposeGenerateButton
            {...btnProps}
            className={cn("btn-generate w-full sm:w-auto min-h-12 font-semibold border-0 px-6", "hidden md:inline-flex")}
          />
          <p className="text-xs text-muted-foreground/70 text-center sm:text-right max-w-[280px] leading-relaxed">
            {generateDisabled && !loading ? d.generateCtaHelperDisabled : d.generateCtaHelper}
          </p>
          {usage?.limit != null && usage.count >= Math.max(0, usage.limit - 2) && (
            <Link href="/#pricing" className="text-xs font-semibold text-primary hover:underline text-center sm:text-right">
              {d.upgrade} →
            </Link>
          )}
        </div>
      </header>

      <div
        className="md:hidden fixed bottom-[4.5rem] left-0 right-0 z-[35] border-t border-border/40 bg-background/95 px-4 py-3 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        role="region"
        aria-label={d.generateCtaHelper}
      >
        <RepurposeGenerateButton {...btnProps} className="btn-generate w-full min-h-12 font-semibold border-0 px-6" />
      </div>
    </>
  );
}
