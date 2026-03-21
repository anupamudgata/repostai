"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PHRASE = "DELETE MY ACCOUNT";

function extractDeletionToken(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  try {
    const u = new URL(t);
    const q = u.searchParams.get("token");
    if (q) return q;
  } catch {
    /* pasted token only */
  }
  return t;
}

function ConfirmDeleteInner() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [token, setToken] = useState(tokenFromUrl);
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const confirmed = confirmText === PHRASE;

  async function handleDelete() {
    const resolved = extractDeletionToken(token);
    if (!confirmed || !resolved) return;
    setStatus("deleting");
    setError("");
    try {
      const res = await fetch("/api/user/delete/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resolved, confirm: PHRASE }),
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
          href="/dashboard/settings/delete"
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
          ← Back
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
            Confirm deletion
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            You opened the link from your email. Type the phrase below to permanently delete your
            account and all associated data. You will receive a final confirmation email.
          </p>
          {!tokenFromUrl && (
            <label
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Deletion token (from email link)
            </label>
          )}
          {!tokenFromUrl && (
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={status === "deleting"}
              placeholder="Paste the full URL or token from your email…"
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: "12px",
                marginBottom: "16px",
                boxSizing: "border-box",
                fontFamily: "monospace",
              }}
            />
          )}
          <label
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Type <strong>{PHRASE}</strong> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={status === "deleting"}
            placeholder={PHRASE}
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
            <p style={{ fontSize: "13px", color: "#DC2626", marginBottom: "12px" }}>{error}</p>
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
              type="button"
              onClick={handleDelete}
              disabled={!confirmed || !extractDeletionToken(token) || status === "deleting"}
              style={{
                padding: "10px 20px",
                borderRadius: "8px",
                border: "none",
                background: confirmed && extractDeletionToken(token) ? "#DC2626" : "#FCA5A5",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: confirmed && extractDeletionToken(token) ? "pointer" : "default",
                opacity: confirmed && extractDeletionToken(token) ? 1 : 0.6,
              }}
            >
              {status === "deleting" ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmDeletePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: "center", color: "#6B7280" }}>Loading…</div>
      }
    >
      <ConfirmDeleteInner />
    </Suspense>
  );
}
