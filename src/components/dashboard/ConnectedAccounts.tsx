"use client";

import { useState, useEffect } from "react";
import type { ConnectedAccount, Platform } from "@/lib/social/types";

const PLATFORM_META: Record<Platform, { label: string; color: string; connectUrl: string }> = {
  linkedin:  { label: "LinkedIn",    color: "#0A66C2", connectUrl: "/api/social/connect/linkedin" },
  twitter:   { label: "X / Twitter", color: "#1D9BF0", connectUrl: "" },
  facebook:  { label: "Facebook",    color: "#1877F2", connectUrl: "" },
  instagram: { label: "Instagram",   color: "#E1306C", connectUrl: "" },
  reddit:    { label: "Reddit",      color: "#FF4500", connectUrl: "" },
};

export function ConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => { setAccounts(data.connectedAccounts ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const connected = new Set(accounts.map((a) => a.platform));

  if (loading) return <p className="text-sm text-muted-foreground">Loading accounts...</p>;

  return (
    <div className="flex flex-col gap-2.5">
      {(Object.entries(PLATFORM_META) as [Platform, (typeof PLATFORM_META)[Platform]][]).map(([platform, meta]) => {
        const isConnected = connected.has(platform);
        const account = accounts.find((a) => a.platform === platform);
        return (
          <div
            key={platform}
            className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
              isConnected
                ? "bg-card border-border"
                : "bg-muted/30 border-border"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: meta.color }}
              >
                {meta.label[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{meta.label}</div>
                {isConnected && account?.platformUsername && (
                  <div className="text-xs text-muted-foreground">@{account.platformUsername}</div>
                )}
              </div>
            </div>
            {isConnected ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Connected
              </span>
            ) : meta.connectUrl ? (
              <a
                href={meta.connectUrl}
                className="text-xs font-semibold px-3.5 py-1 rounded-lg border transition-colors hover:opacity-80"
                style={{ color: meta.color, borderColor: `${meta.color}40`, background: `${meta.color}08` }}
              >
                Connect
              </a>
            ) : (
              <span className="text-[11px] text-muted-foreground/50">Coming soon</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
