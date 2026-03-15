"use client";

import { useState } from "react";

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ open, onClose }: DeleteAccountDialogProps) {
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
      if (!res.ok) { setError(data.error ?? "Deletion failed"); setStatus("error"); return; }
      setStatus("done");
      window.location.href = "/";
    } catch {
      setError("Network error");
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.5)" }}>
      <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "440px", width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,.15)" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#DC2626", marginBottom: "8px" }}>Delete your account</h2>
        <p style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.6, marginBottom: "16px" }}>This will permanently delete your account, all data, and cancel any active subscriptions. This action cannot be undone.</p>
        <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Type <strong>DELETE MY ACCOUNT</strong> to confirm:</label>
        <input
          type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} disabled={status === "deleting"}
          style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "14px", marginBottom: "16px", boxSizing: "border-box", outline: "none" }}
          placeholder="DELETE MY ACCOUNT"
        />
        {error && <p style={{ fontSize: "12px", color: "#DC2626", marginBottom: "10px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} disabled={status === "deleting"} style={{ padding: "8px 18px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleDelete} disabled={!confirmed || status === "deleting"} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: confirmed ? "#DC2626" : "#FCA5A5", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: confirmed ? "pointer" : "default", opacity: confirmed ? 1 : 0.5 }}>
            {status === "deleting" ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
