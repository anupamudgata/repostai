"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SUPPORT_EMAIL } from "@/config/constants";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.message) {
        toast.info(data.message);
        window.location.href = `mailto:${SUPPORT_EMAIL}`;
      } else {
        toast.error("Could not open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: "8px 20px",
        borderRadius: "8px",
        border: "1px solid #E5E7EB",
        background: "#FFFFFF",
        color: "#374151",
        fontSize: "13px",
        fontWeight: 600,
        cursor: loading ? "wait" : "pointer",
        transition: "all .15s",
      }}
    >
      {loading ? "Opening..." : "Manage billing"}
    </button>
  );
}
