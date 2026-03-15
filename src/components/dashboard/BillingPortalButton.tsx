"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick} disabled={loading}
      style={{
        padding: "8px 20px", borderRadius: "8px", border: "1px solid #E5E7EB",
        background: "#FFFFFF", color: "#374151", fontSize: "13px", fontWeight: 600,
        cursor: loading ? "wait" : "pointer", transition: "all .15s",
      }}
    >
      {loading ? "Opening..." : "Manage billing"}
    </button>
  );
}
