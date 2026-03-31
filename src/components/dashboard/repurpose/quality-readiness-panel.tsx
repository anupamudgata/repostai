"use client";

import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";
import type { InputType } from "@/types";

function df(
  template: string,
  vars: Record<string, string | number>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export type ReadinessItem = { ok: boolean; label: string };

export function QualityReadinessPanel({
  d,
  items,
}: {
  d: DashboardBulk;
  items: ReadinessItem[];
}) {
  const allOk = items.every((i) => i.ok);
  const badCount = items.filter((i) => !i.ok).length;

  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4 space-y-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{d.readinessTitle}</h3>
        {allOk ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {d.readinessAllOk}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {df(d.readinessIssuesSummary, { count: badCount })}
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className={cn(
              "flex items-start gap-2 text-xs leading-snug",
              item.ok ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {item.ok ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500 mt-0.5" />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function buildReadinessItems(
  d: DashboardBulk,
  params: {
    inputType: InputType;
    content: string;
    url: string;
    bulkUrls: string;
    bulkMode: boolean;
    pdfExtractedText: string;
    selectedCount: number;
    limitReached: boolean;
    isValidUrl: (s: string) => boolean;
    parseBulkUrls: (s: string) => string[];
  }
): ReadinessItem[] {
  const {
    inputType,
    content,
    url,
    bulkUrls,
    bulkMode,
    pdfExtractedText,
    selectedCount,
    limitReached,
    isValidUrl,
    parseBulkUrls,
  } = params;

  const items: ReadinessItem[] = [];

  let sourceOk = false;
  let sourceBadLabel = d.readinessSource;
  if (inputType === "text") {
    sourceOk = content.trim().length >= 8;
  } else if (inputType === "pdf") {
    sourceOk = pdfExtractedText.trim().length >= 8;
    sourceBadLabel = d.readinessPdf;
  } else if (inputType === "youtube") {
    sourceOk = url.trim().length > 0;
    sourceBadLabel = d.readinessYoutube;
  } else if (inputType === "url") {
    if (bulkMode) {
      const v = parseBulkUrls(bulkUrls).filter(isValidUrl);
      sourceOk = v.length >= 2 && v.length <= 5;
      sourceBadLabel = d.readinessBulk;
    } else {
      sourceOk = isValidUrl(url.trim());
      sourceBadLabel = d.readinessUrl;
    }
  }
  items.push({
    ok: sourceOk,
    label: sourceOk ? d.readinessSourceOk : sourceBadLabel,
  });

  items.push({
    ok: selectedCount > 0,
    label: selectedCount > 0 ? d.readinessPlatformsOk : d.readinessPlatforms,
  });

  items.push({
    ok: !limitReached,
    label: limitReached ? d.readinessLimit : d.readinessLimitOk,
  });

  return items;
}
