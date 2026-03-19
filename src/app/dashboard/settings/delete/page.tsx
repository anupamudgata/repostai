"use client";

import { useState } from "react";
import Link from "next/link";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const confirmed = confirmText === "DELETE MY ACCOUNT";

  async function handleDelete() {
    if (!confirmed) return;
    setStatus("deleting");
    setError("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE MY ACCOUNT" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Deletion failed");
        setStatus("error");
        return;
      }
      setStatus("done");
      window.location.href = "/";
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9FAFB",
        padding: "40px 24px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Link
          href="/dashboard/settings"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#6B7280",
            marginBottom: "24px",
            textDecoration: "none",
          }}
        >
          ← Back to settings
        </Link>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#DC2626",
              marginBottom: "8px",
            }}
          >
            Delete your account
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            This will permanently delete your account, all data, and cancel any
            active subscriptions. This action cannot be undone.
          </p>
          <label
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Type <strong>DELETE MY ACCOUNT</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={status === "deleting"}
            placeholder="DELETE MY ACCOUNT"
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "14px",
              marginBottom: "16px",
              boxSizing: "border-box",
              outline: "none",
            }}
          />
          {error && (
            <p
              style={{
                fontSize: "13px",
                color: "#DC2626",
                marginBottom: "12px",
              }}
            >
              {error}
            </p>
          )}
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <Link
              href="/dashboard/settings"
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                background: "#fff",
                color: "#374151",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Cancel
            </Link>
            <button
              onClick={handleDelete}
              disabled={!confirmed || status === "deleting"}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: confirmed ? "#DC2626" : "#FCA5A5",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: confirmed ? "pointer" : "default",
                opacity: confirmed ? 1 : 0.6,
              }}
            >
              {status === "deleting" ? "Deleting..." : "Delete permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
