"use client";

import { useState, useEffect } from "react";
import type { ConnectedAccount, Platform } from "@/lib/social/types";

const PLATFORM_META: Record<Platform, { label: string; color: string; connectUrl: string }> = {
  linkedin:  { label: "LinkedIn",  color: "#0A66C2", connectUrl: "/api/social/connect/linkedin" },
  twitter:   { label: "X / Twitter", color: "#0F172A", connectUrl: "" },
  facebook:  { label: "Facebook",  color: "#1877F2", connectUrl: "" },
  instagram: { label: "Instagram", color: "#C13584", connectUrl: "" },
  reddit:    { label: "Reddit",    color: "#FF4500", connectUrl: "" },
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

  if (loading) return <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Loading accounts...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {(Object.entries(PLATFORM_META) as [Platform, (typeof PLATFORM_META)[Platform]][]).map(([platform, meta]) => {
        const isConnected = connected.has(platform);
        const account = accounts.find((a) => a.platform === platform);
        return (
          <div key={platform} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", border: isConnected ? `1px solid ${meta.color}30` : "1px solid #E5E7EB", background: isConnected ? `${meta.color}08` : "#FAFAFA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: meta.color, color: "#fff", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{meta.label[0]}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{meta.label}</div>
                {isConnected && account?.platformUsername && <div style={{ fontSize: "11px", color: "#6B7280" }}>@{account.platformUsername}</div>}
              </div>
            </div>
            {isConnected ? (
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#16A34A", background: "#F0FDF4", padding: "3px 10px", borderRadius: "999px", border: "1px solid #BBF7D0" }}>Connected</span>
            ) : meta.connectUrl ? (
              <a href={meta.connectUrl} style={{ fontSize: "12px", fontWeight: 600, color: meta.color, textDecoration: "none", padding: "5px 14px", borderRadius: "8px", border: `1px solid ${meta.color}40`, background: `${meta.color}08` }}>Connect</a>
            ) : (
              <span style={{ fontSize: "11px", color: "#CBD5E1" }}>Coming soon</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
