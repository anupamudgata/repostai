"use client";

import { useState } from "react";
import type { Platform } from "@/lib/social/types";

interface OneClickPostProps {
  content: string;
  platform: Platform;
  disabled?: boolean;
}

export function OneClickPost({ content, platform, disabled }: OneClickPostProps) {
  const [status, setStatus] = useState<"idle" | "posting" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handlePost() {
    if (!content.trim()) return;
    setStatus("posting");
    setError("");
    try {
      const res = await fetch("/api/social/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: [{ platform, text: content }] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Post failed"); setStatus("error"); return; }
      const result = data.results?.[0];
      if (result?.success) { setStatus("done"); setTimeout(() => setStatus("idle"), 3000); }
      else { setError(result?.error ?? "Post failed"); setStatus("error"); }
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  const labels: Record<Platform, string> = { linkedin: "LinkedIn", twitter: "X", facebook: "Facebook", reddit: "Reddit", instagram: "Instagram" };

  return (
    <button
      onClick={handlePost}
      disabled={disabled || status === "posting" || !content.trim()}
      title={error || undefined}
      style={{
        padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: disabled ? "default" : "pointer",
        border: status === "done" ? "1px solid #BBF7D0" : status === "error" ? "1px solid #FECACA" : "1px solid #E5E7EB",
        background: status === "done" ? "#F0FDF4" : status === "error" ? "#FEF2F2" : status === "posting" ? "#F9FAFB" : "#FFFFFF",
        color: status === "done" ? "#16A34A" : status === "error" ? "#DC2626" : "#374151",
        opacity: disabled ? 0.5 : 1, transition: "all .15s",
      }}
    >
      {status === "posting" ? "Posting..." : status === "done" ? `✓ Posted to ${labels[platform]}` : status === "error" ? "Failed" : `Post to ${labels[platform]}`}
    </button>
  );
}
