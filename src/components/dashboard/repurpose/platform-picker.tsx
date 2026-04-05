"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { PLATFORM_GROUPS, SUPPORTED_PLATFORMS } from "@/config/constants";
import type { Platform } from "@/types";
import { cn } from "@/lib/utils";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";

const PLATFORM_BY_ID = Object.fromEntries(
  SUPPORTED_PLATFORMS.map((p) => [p.id, p])
) as Record<string, (typeof SUPPORTED_PLATFORMS)[number]>;

const VALID_PLATFORM_IDS = new Set<string>(
  SUPPORTED_PLATFORMS.map((p) => p.id)
);

const RECENT_PLATFORMS_KEY = "repostai_recent_platforms";

function loadRecentPlatformsFromStorage(): Platform[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_PLATFORMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: Platform[] = [];
    for (const id of parsed) {
      if (typeof id === "string" && VALID_PLATFORM_IDS.has(id)) {
        out.push(id as Platform);
      }
    }
    return out.slice(0, 3);
  } catch {
    return [];
  }
}

export function PlatformPicker({
  d,
  isFreePlan,
  freePlatformSet,
  selectedPlatforms,
  onToggle,
}: {
  d: DashboardBulk;
  isFreePlan: boolean;
  freePlatformSet: Set<string>;
  selectedPlatforms: Platform[];
  onToggle: (platform: Platform) => void;
}) {
  const [recentPlatforms, setRecentPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    setRecentPlatforms(loadRecentPlatformsFromStorage());
  }, []);

  const handlePlatformClick = useCallback(
    (id: Platform) => {
      const isLocked = isFreePlan && !freePlatformSet.has(id);
      if (isLocked) return;
      const wasSelected = selectedPlatforms.includes(id);
      onToggle(id);
      if (!wasSelected) {
        setRecentPlatforms((prev) => {
          const next = [id, ...prev.filter((p) => p !== id)].slice(0, 3);
          try {
            localStorage.setItem(RECENT_PLATFORMS_KEY, JSON.stringify(next));
          } catch {
            /* ignore quota / private mode */
          }
          return next;
        });
      }
    },
    [isFreePlan, freePlatformSet, selectedPlatforms, onToggle]
  );

  const renderChip = (id: string, recentHighlight: boolean) => {
    const platform = PLATFORM_BY_ID[id];
    if (!platform) return null;
    const isLocked = isFreePlan && !freePlatformSet.has(id);
    const isSelected = selectedPlatforms.includes(id as Platform);
    return (
      <button
        key={`${id}-${recentHighlight ? "r" : "g"}`}
        type="button"
        disabled={isLocked}
        onClick={() => !isLocked && handlePlatformClick(id as Platform)}
        title={isLocked ? d.platformLockTitle : undefined}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition-all duration-200",
          "min-h-[44px] px-3.5 py-2 touch-manipulation select-none",
          isLocked
            ? "opacity-40 cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground"
            : isSelected
              ? "platform-chip-selected"
              : "border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
          recentHighlight &&
            !isLocked &&
            "ring-2 ring-primary/35 ring-offset-2 ring-offset-background"
        )}
      >
        {isLocked && <Lock className="h-3.5 w-3.5 shrink-0" />}
        {isSelected && !isLocked && (
          <Check className="h-3.5 w-3.5 shrink-0 text-white/90" />
        )}
        {platform.name}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {isFreePlan && (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {d.freePlanPlatformsBefore}{" "}
          <Link href="/#pricing" className="text-primary font-medium hover:underline">
            {d.freePlanPlatformsLink}
          </Link>{" "}
          {d.freePlanPlatformsAfter}
        </p>
      )}
      {recentPlatforms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
            {d.recentPlatformsTitle}
          </p>
          <div className="flex flex-wrap gap-2">
            {recentPlatforms.map((id) => renderChip(id, true))}
          </div>
        </div>
      )}
      {PLATFORM_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2.5">
            {d.platformGroups[group.id as keyof typeof d.platformGroups]}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.platformIds.map((id) => {
              const inRecent = recentPlatforms.includes(id as Platform);
              return renderChip(id, inRecent);
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
