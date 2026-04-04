"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const PHRASE = "DELETE MY ACCOUNT";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "emailing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const confirmed = confirmText === PHRASE;

  async function requestEmailLink() {
    setStatus("emailing");
    setError("");
    try {
      const res = await fetch("/api/user/delete/request", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send email");
        setStatus("error");
        return;
      }
      setEmailSent(true);
      setStatus("idle");
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  async function deleteNow() {
    if (!confirmed) return;
    setStatus("deleting");
    setError("");
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: PHRASE }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Deletion failed");
        setStatus("error");
        return;
      }
      setStatus("done");
      await createClient().auth.signOut();
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
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
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
            marginBottom: "20px",
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
            Under GDPR you have the right to erasure. We remove your profile, repurposed content,
            brand voices, scheduled posts, analytics rows, OAuth connections, and billing rows
            stored in our database, then delete your login. You may receive a short confirmation
            email when deletion finishes.
          </p>

          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827", marginBottom: "10px" }}>
            Recommended: confirm by email
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "12px" }}>
            We&apos;ll send a signed link (valid ~48 hours). Open it and type the confirmation phrase
            to complete deletion — useful if someone else might access your logged-in session.
          </p>
          <button
            type="button"
            onClick={requestEmailLink}
            disabled={status === "emailing"}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1px solid #DC2626",
              background: "#fff",
              color: "#DC2626",
              fontSize: "14px",
              fontWeight: 600,
              cursor: status === "emailing" ? "wait" : "pointer",
              marginBottom: "12px",
            }}
          >
            {status === "emailing" ? "Sending…" : "Email me a confirmation link"}
          </button>
          {emailSent && (
            <p style={{ fontSize: "13px", color: "#059669", marginBottom: "8px" }}>
              Check your inbox. If it doesn&apos;t arrive, look in spam or use “Delete now” below.
            </p>
          )}
          <p style={{ fontSize: "13px", marginBottom: "0" }}>
            <Link
              href="/dashboard/settings/delete/confirm"
              style={{ color: "#2563EB", fontWeight: 500, textDecoration: "none" }}
            >
              I have the link — open confirmation page
            </Link>
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #FECACA",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,.05)",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
            Delete now (signed in)
          </h2>
          <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" }}>
            Permanently delete while you are logged in. This cannot be undone.
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
              onClick={deleteNow}
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
              {status === "deleting" ? "Deleting…" : "Delete permanently"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
