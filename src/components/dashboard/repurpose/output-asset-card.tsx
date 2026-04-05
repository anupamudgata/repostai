"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Send,
  CalendarClock,
  Minimize2,
  Maximize2,
  Zap,
  Briefcase,
  PenLine,
  ChevronDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CharacterCount } from "@/components/dashboard/repurpose/character-count";
import type { Platform } from "@/types";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";
import { cn } from "@/lib/utils";

export type RefineIntent = "shorten" | "expand" | "punchy" | "professional" | "rewrite";

function computeOutputQualityScore(
  content: string,
  maxLength: number | null
): number {
  let score = 0;
  const len = content.length;
  const trimmed = content.trim();

  if (len > 50) score += 20;

  if (maxLength != null && maxLength > 0) {
    const low = Math.max(40, Math.floor(maxLength * 0.22));
    if (len >= low && len <= maxLength) score += 30;
  } else if (len >= 320 && len <= 10000) {
    score += 30;
  }

  if (/\p{Extended_Pictographic}/u.test(content)) score += 10;

  if (/#\w/u.test(trimmed)) score += 15;

  const tail = trimmed.slice(-160);
  if (
    /\?\s*$/.test(trimmed) ||
    /(learn more|comment below|sign up|subscribe|let me know|link in bio|dm me|try it|get started|read more|share your|thoughts\?)/i.test(
      tail
    )
  ) {
    score += 25;
  }

  return Math.min(100, score);
}

const REGENERATE_TONE_HINTS: { label: string; hint: string }[] = [
  { label: "Make it more casual", hint: "Make it more casual" },
  { label: "Make it more professional", hint: "Make it more professional" },
  { label: "Make it shorter", hint: "Make it shorter" },
  { label: "Make it longer", hint: "Make it longer" },
];

export function OutputAssetCard({
  d,
  df,
  output,
  platformName,
  maxLength,
  provider,
  account,
  copied,
  regenerating,
  refineBusyKey,
  refineScopeId,
  posting,
  bulkPosting,
  scheduleSubmitting,
  onCopy,
  onRegenerate,
  onRefine,
  onPostNow,
  onSchedule,
  connectHref,
  connectLabel,
  cardReorder,
}: {
  d: DashboardBulk;
  df: (template: string, vars: Record<string, string | number>) => string;
  output: { platform: Platform; content: string };
  platformName: string;
  maxLength: number | null;
  provider: string | null;
  account: { id: string; platform: string } | undefined;
  copied: boolean;
  regenerating: boolean;
  /** Matches `${refineScopeId}-${platform}-${intent}` while a refine request is in flight. */
  refineBusyKey: string | null;
  /** Job id used with the repurpose API for this card (single: last job; bulk: source job). */
  refineScopeId: string;
  posting: boolean;
  bulkPosting: boolean;
  scheduleSubmitting: boolean;
  onCopy: () => void;
  onRegenerate: (instructionHint?: string) => void;
  onRefine: (intent: RefineIntent) => void;
  onPostNow: () => void;
  onSchedule: () => void;
  connectHref?: string;
  connectLabel?: string;
  cardReorder?: {
    canUp: boolean;
    canDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
  };
}) {
  // Derive expanded state from content key — auto-collapses when content changes
  const contentKey = `${output.platform}::${output.content}`;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const bodyExpanded = expandedKey === contentKey;
  const longBody = output.content.length > 300;
  const collapsedPreview =
    longBody && !bodyExpanded
      ? `${output.content.slice(0, 200)}…`
      : output.content;

  const [copyShortcutLabel] = useState(() => {
    if (typeof navigator === "undefined") return "Copy (Ctrl+C)";
    return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent || navigator.platform || "")
      ? "Copy (⌘C)"
      : "Copy (Ctrl+C)";
  });

  const trimmedOut = output.content.trim();
  const outputWordCount = trimmedOut
    ? trimmedOut.split(/\s+/).filter(Boolean).length
    : 0;
  const outputCharCount = output.content.length;
  const showOutputStats = trimmedOut.length > 0;

  const qualityScore = useMemo(
    () => computeOutputQualityScore(output.content, maxLength),
    [output.content, maxLength]
  );
  const scoreBadgeClass =
    qualityScore >= 70
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
      : qualityScore >= 40
        ? "border-amber-500/25 bg-amber-500/10 text-amber-900 dark:text-amber-200"
        : "border-destructive/30 bg-destructive/10 text-destructive";

  const refinements: { id: RefineIntent; label: string; icon: typeof Minimize2 }[] = [
    { id: "shorten", label: d.refineShorten, icon: Minimize2 },
    { id: "expand", label: d.refineExpand, icon: Maximize2 },
    { id: "punchy", label: d.refinePunchy, icon: Zap },
    { id: "professional", label: d.refineProfessional, icon: Briefcase },
    { id: "rewrite", label: d.refineRewrite, icon: PenLine },
  ];

  return (
    <article
      className={cn(
        "output-card rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-3 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-center gap-1.5 min-w-0">
          {cardReorder && (
            <div className="flex flex-col gap-0 shrink-0 border border-border/50 rounded-md overflow-hidden bg-muted/20">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-7 p-0 rounded-none border-b border-border/40"
                disabled={!cardReorder.canUp}
                onClick={cardReorder.onMoveUp}
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-7 p-0 rounded-none"
                disabled={!cardReorder.canDown}
                onClick={cardReorder.onMoveDown}
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          )}
          <h3 className="text-sm font-semibold text-foreground truncate">
            {platformName}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {provider && (
            <>
              <Button
                size="sm"
                variant="default"
                className="h-8 text-xs"
                onClick={onPostNow}
                disabled={posting || !account || bulkPosting}
                title={!account ? connectLabel : undefined}
              >
                {posting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    {d.postNow}
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={onSchedule}
                disabled={scheduleSubmitting}
              >
                <CalendarClock className="h-3 w-3 mr-1" />
                {d.schedule}
              </Button>
              {!account && connectHref && (
                <Link
                  href={connectHref}
                  className="text-xs text-primary hover:underline font-medium px-1"
                >
                  {connectLabel}
                </Link>
              )}
            </>
          )}
          <div className="flex items-center rounded-md border border-transparent hover:border-border/60">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-xs rounded-r-none"
              onClick={() => onRegenerate()}
              disabled={regenerating}
              title={d.refineRegenerate}
            >
              {regenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-xs rounded-l-none border-l border-border/40"
                  disabled={regenerating}
                  aria-label={`${d.refineRegenerate} — tone`}
                >
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                {REGENERATE_TONE_HINTS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.hint}
                    className="text-xs"
                    onClick={() => onRegenerate(opt.hint)}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn("h-8 px-2 text-xs", copied && "text-primary")}
                  onClick={onCopy}
                  aria-label={copyShortcutLabel}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{copyShortcutLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div className="rounded-lg border border-border/30 bg-muted/10 px-3 py-3 text-sm whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed selection:bg-primary/20">
          {collapsedPreview}
          {longBody && (
            <button
              type="button"
              onClick={() => setExpandedKey(bodyExpanded ? null : contentKey)}
              className="mt-2 block text-xs text-primary underline"
            >
              {bodyExpanded ? "Show less" : "Show more"}
            </button>
          )}
          {showOutputStats && (
            <p className="mt-2 text-[10px] text-muted-foreground/60 tabular-nums">
              {outputWordCount} words · {outputCharCount} chars
            </p>
          )}
        </div>
        <CharacterCount
          content={output.content}
          platformId={output.platform}
          maxLength={maxLength}
          platformName={platformName}
        />
        <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
          {refinements.map((r) => {
            const busy =
              refineBusyKey === `${refineScopeId}-${output.platform}-${r.id}`;
            return (
              <Button
                key={r.id}
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 text-[11px] px-2 gap-1 font-normal"
                disabled={regenerating || refineBusyKey !== null}
                onClick={() => onRefine(r.id)}
              >
                {busy ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <r.icon className="h-3 w-3 opacity-70" />
                )}
                {r.label}
              </Button>
            );
          })}
        </div>
        <div className="flex justify-end pt-1 border-t border-border/20">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold tabular-nums px-2 py-0.5",
              scoreBadgeClass
            )}
          >
            {df(d.outputQualityScore, { score: qualityScore })}
          </Badge>
        </div>
      </div>
    </article>
  );
}
