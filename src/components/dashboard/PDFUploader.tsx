"use client";
// src/components/dashboard/PDFUploader.tsx
// FIX #5: Full drag-drop, 10MB limit error, progress bar, file type validation

import { useState, useRef, useCallback } from "react";

const MAX_MB    = 10;
const MAX_BYTES = MAX_MB * 1024 * 1024;

interface Props { onExtracted: (text: string, fileName: string) => void; }

type State = "idle" | "dragover" | "uploading" | "done" | "error";

export function PDFUploader({ onExtracted }: Props) {
  const [state,    setState]    = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const process = useCallback(async (file: File) => {
    // Type check
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Only PDF files are supported. Please select a .pdf file.");
      setState("error");
      return;
    }
    // Size check
    if (file.size > MAX_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      setError(`File is ${mb}MB — maximum is ${MAX_MB}MB. Try compressing the PDF or splitting it into smaller parts.`);
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("uploading");
    setProgress(10);
    setError("");

    const tick = setInterval(() => setProgress(p => Math.min(p + 10, 85)), 300);

    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/extract/pdf", { method: "POST", body: form });
      clearInterval(tick);
      setProgress(100);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Upload failed (${res.status})`);
      }
      const data = await res.json();
      setState("done");
      onExtracted(data.text ?? "", file.name);
    } catch (err) {
      clearInterval(tick);
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setState("error");
      setProgress(0);
    }
  }, [onExtracted]);

  const reset = () => { setState("idle"); setProgress(0); setError(""); setFileName(""); if (inputRef.current) inputRef.current.value = ""; };

  const isDrag    = state === "dragover";
  const isLoading = state === "uploading";
  const isDone    = state === "done";
  const isError   = state === "error";

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setState("dragover"); }}
        onDragLeave={() => !isLoading && !isDone && setState("idle")}
        onDrop={(e) => { e.preventDefault(); setState("idle"); const f = e.dataTransfer.files[0]; if (f) process(f); }}
        onClick={() => !isLoading && !isDone && inputRef.current?.click()}
        style={{
          border:        `2px dashed ${isDrag ? "#2563EB" : isError ? "#DC2626" : isDone ? "#16A34A" : "#D1D5DB"}`,
          borderRadius:  "12px",
          padding:       "28px 20px",
          textAlign:     "center",
          background:    isDrag ? "#EFF6FF" : isError ? "#FEF2F2" : isDone ? "#F0FDF4" : "#FAFAFA",
          cursor:        isLoading || isDone ? "default" : "pointer",
          transition:    "all .2s",
          userSelect:    "none",
        }}
      >
        <input ref={inputRef} type="file" accept=".pdf,application/pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) process(f); }} />

        {/* Icon */}
        <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: isDone ? "#DCFCE7" : isError ? "#FEE2E2" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          {isDone
            ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>
            : isError
            ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>
            : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6M12 18v-6M9 15l3-3 3 3"/></svg>
          }
        </div>

        {isDone ? (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#16A34A", marginBottom: "3px" }}>{fileName}</p>
            <p style={{ fontSize: "12px", color: "#4B7B5E", marginBottom: "8px" }}>Extracted successfully</p>
            <button onClick={(e) => { e.stopPropagation(); reset(); }} style={{ fontSize: "12px", color: "#6B7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Upload different file
            </button>
          </>
        ) : isLoading ? (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "10px" }}>Uploading {fileName}...</p>
            <div style={{ width: "180px", height: "5px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden", margin: "0 auto 6px" }}>
              <div style={{ height: "5px", width: `${progress}%`, background: "#2563EB", borderRadius: "999px", transition: "width .3s ease" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{progress}%</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: isDrag ? "#2563EB" : "#374151", marginBottom: "3px" }}>
              {isDrag ? "Drop it here" : "Drag & drop your PDF"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "6px" }}>
              or <span style={{ color: "#2563EB", fontWeight: 500 }}>click to browse</span>
            </p>
            <p style={{ fontSize: "11px", color: "#CBD5E1" }}>PDF only · Max {MAX_MB}MB</p>
          </>
        )}
      </div>

      {/* Error message below zone */}
      {isError && error && (
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "10px", padding: "10px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px" }}>
          <span style={{ color: "#DC2626", flexShrink: 0, fontSize: "15px", lineHeight: 1 }}>⚠</span>
          <div>
            <p style={{ fontSize: "12px", color: "#DC2626", lineHeight: 1.5, margin: "0 0 4px" }}>{error}</p>
            <button onClick={reset} style={{ fontSize: "11px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
