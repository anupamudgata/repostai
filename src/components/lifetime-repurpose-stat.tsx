"use client";

import { useEffect, useState } from "react";
import { Repeat2 } from "lucide-react";
function pf(
  template: string,
  vars: Record<string, string | number>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export function LifetimeRepurposeStat({
  L,
  variant,
}: {
  L: { lifetimeRepurposeStat: string };
  variant: "hero" | "footer";
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((data: { totalRepurposes?: number }) => {
        if (
          cancelled ||
          typeof data.totalRepurposes !== "number" ||
          Number.isNaN(data.totalRepurposes)
        ) {
          return;
        }
        setCount(data.totalRepurposes);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    if (variant === "footer") return null;
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-4 py-2 text-sm text-muted-foreground tabular-nums"
        aria-hidden
      >
        <Repeat2 className="h-4 w-4 shrink-0 opacity-60 animate-pulse" />
        <span className="min-w-[8ch]">…</span>
      </div>
    );
  }

  const formatted = count.toLocaleString();
  const label = pf(L.lifetimeRepurposeStat, { count: formatted });

  if (variant === "footer") {
    return (
      <p className="text-xs text-muted-foreground tabular-nums flex items-center justify-center sm:justify-start gap-1.5 mb-3">
        <Repeat2 className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        <span>{label}</span>
      </p>
    );
  }

  return (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/25 px-4 py-2 text-sm font-medium text-foreground tabular-nums shadow-sm"
      title={label}
    >
      <Repeat2 className="h-4 w-4 text-primary shrink-0" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
