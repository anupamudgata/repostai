"use client";

import { SUPPORTED_PLATFORMS } from "@/config/constants";
import type { Platform } from "@/types";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";

export function GenerationPreviewStrip({
  d,
  df,
  selectedPlatforms,
  bulkMode,
  inputType,
  bulkUrlCount,
}: {
  d: DashboardBulk;
  df: (template: string, vars: Record<string, string | number>) => string;
  selectedPlatforms: Platform[];
  bulkMode: boolean;
  inputType: string;
  bulkUrlCount: number;
}) {
  if (selectedPlatforms.length === 0) return null;

  const names = selectedPlatforms.map(
    (id) => SUPPORTED_PLATFORMS.find((p) => p.id === id)?.name ?? id
  );
  const isBulk = inputType === "url" && bulkMode;
  const outputs = isBulk
    ? bulkUrlCount * selectedPlatforms.length
    : selectedPlatforms.length;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 px-4 py-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {d.previewBeforeTitle}
      </p>
      <p className="text-sm text-foreground">
        {isBulk
          ? df(d.previewExpectedAssetsBulk, {
              outputs,
              sources: bulkUrlCount,
              platforms: selectedPlatforms.length,
            })
          : df(d.previewExpectedAssets, { count: selectedPlatforms.length })}
      </p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-medium text-foreground/80">{d.previewMixLabel}:</span>{" "}
        {names.join(" · ")}
      </p>
    </div>
  );
}
