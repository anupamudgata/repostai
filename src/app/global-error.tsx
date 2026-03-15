"use client";
// src/app/global-error.tsx
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <html><body>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: "2rem", textAlign: "center", background: "#f9fafb" }}>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "2.5rem", maxWidth: "440px", width: "100%" }}>
          <div style={{ width: "48px", height: "48px", background: "#FEE2E2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", fontSize: "22px", color: "#DC2626" }}>!</div>
          <h1 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Something went wrong</h1>
          <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>An unexpected error occurred. Our team has been notified.</p>
          <button onClick={reset} style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Try again</button>
          {error.digest && <p style={{ fontSize: "11px", color: "#D1D5DB", marginTop: "16px" }}>Error ID: {error.digest}</p>}
        </div>
      </div>
    </body></html>
  );
}
