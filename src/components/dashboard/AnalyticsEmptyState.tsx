"use client";
// src/components/dashboard/AnalyticsEmptyState.tsx
// FIX #4: Analytics empty state with clear CTA

export function AnalyticsEmptyState({ metric }: { metric?: string }) {
  return (
    <div style={{
      textAlign:    "center",
      padding:      "40px 24px",
      background:   "#FAFAFA",
      border:       "1px dashed #E5E7EB",
      borderRadius: "12px",
    }}>
      <div style={{
        width:          "48px",
        height:         "48px",
        borderRadius:   "12px",
        background:     "#EFF6FF",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        margin:         "0 auto 14px",
      }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
          stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      </div>
      <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>
        {metric ? `No ${metric} data yet` : "No analytics yet"}
      </h3>
      <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, maxWidth: "300px", margin: "0 auto 18px" }}>
        Start repurposing content and connecting social accounts to track your
        reach, engagement, and growth.
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/dashboard/repurpose" style={{
          padding: "9px 18px", borderRadius: "8px", background: "#1E3A5F",
          color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none",
        }}>
          Start repurposing
        </a>
        <a href="/dashboard/connections" style={{
          padding: "8px 18px", borderRadius: "8px", border: "1px solid #E5E7EB",
          background: "transparent", color: "#374151", fontSize: "13px", fontWeight: 500, textDecoration: "none",
        }}>
          Connect accounts
        </a>
      </div>
    </div>
  );
}
