"use client";

import { useState } from "react";
import Link from "next/link";

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border rounded-2xl p-7 max-w-[440px] w-full shadow-xl mx-4">
        <h2 className="text-lg font-bold text-destructive mb-2">Delete your account</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">
          This will permanently delete your account, all data, and cancel any active subscriptions. This action cannot be undone.
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Prefer a confirmation email first?{" "}
          <Link href="/dashboard/settings/delete" className="text-primary font-semibold" onClick={onClose}>
            Use the full delete page
          </Link>
          .
        </p>
        <label className="text-xs font-semibold text-foreground block mb-1.5">
          Type <strong>DELETE MY ACCOUNT</strong> to confirm:
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          disabled={status === "deleting"}
          className="w-full px-3 py-2.5 rounded-lg border bg-background text-foreground text-sm mb-4 outline-none focus:ring-2 focus:ring-destructive/30"
          placeholder="DELETE MY ACCOUNT"
        />
        {error && <p className="text-xs text-destructive mb-2.5">{error}</p>}
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            disabled={status === "deleting"}
            className="px-4 py-2 rounded-lg border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || status === "deleting"}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-default hover:bg-destructive/90 transition-colors"
          >
            {status === "deleting" ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
