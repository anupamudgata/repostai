"use client";

// src/components/dashboard/PDFUploader.tsx
// FIX #9: Drag-drop zone, 10MB validation, progress indicator, clear error messages
// FIX #12: No dev tools — production-safe component

import { useState, useRef, useCallback } from "react";

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface PDFUploaderProps {
  onExtracted: (text: string) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "done" | "error";

export function PDFUploader({ onExtracted }: PDFUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress,    setProgress]    = useState(0);
  const [errorMsg,    setErrorMsg]    = useState("");
  const [fileName,    setFileName]    = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // Validate type
    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are supported. Please upload a .pdf file.");
      setUploadState("error");
      return;
    }

    // Validate size
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMsg(`File is ${sizeMB}MB — maximum allowed is ${MAX_SIZE_MB}MB. Please compress your PDF or split it into smaller files.`);
      setUploadState("error");
      return;
    }

    setFileName(file.name);
    setUploadState("uploading");
    setProgress(0);
    setErrorMsg("");

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 12, 85));
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract/pdf", {
        method: "POST",
        body:   formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }

      const data = await res.json();
      setUploadState("done");
      onExtracted(data.text ?? "");

    } catch (err) {
      clearInterval(progressInterval);
      setErrorMsg(err instanceof Error ? err.message : "Upload failed. Please try again.");
      setUploadState("error");
    }
  }, [onExtracted]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setUploadState("idle");
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function reset() {
    setUploadState("idle");
    setProgress(0);
    setErrorMsg("");
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const isDragging = uploadState === "dragging";
  const isError    = uploadState === "error";
  const isDone     = uploadState === "done";
  const isUploading = uploadState === "uploading";

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setUploadState("dragging"); }}
        onDragLeave={() => setUploadState("idle")}
        onDrop={handleDrop}
        onClick={() => !isUploading && !isDone && inputRef.current?.click()}
        style={{
          border:        `2px dashed ${
            isDragging ? "#2563EB" :
            isError    ? "#DC2626" :
            isDone     ? "#16A34A" :
            "#D1D5DB"
          }`,
          borderRadius:  "12px",
          padding:       "32px 20px",
          textAlign:     "center",
          background:    isDragging ? "#EFF6FF" : isError ? "#FEF2F2" : isDone ? "#F0FDF4" : "#FAFAFA",
          cursor:        isUploading || isDone ? "default" : "pointer",
          transition:    "all .2s ease",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Icon */}
        <div style={{
          width:          "48px",
          height:         "48px",
          borderRadius:   "10px",
          background:     isDone ? "#DCFCE7" : isError ? "#FEE2E2" : "#EFF6FF",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          margin:         "0 auto 14px",
        }}>
          {isDone ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          ) : isError ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
              stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
              <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          )}
        </div>

        {/* Text */}
        {isDone ? (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#16A34A", marginBottom: "4px" }}>
              {fileName} uploaded
            </p>
            <p style={{ fontSize: "12px", color: "#4B7B5E" }}>Text extracted successfully</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              style={{ marginTop: "10px", fontSize: "12px", color: "#6B7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              Upload a different file
            </button>
          </>
        ) : isUploading ? (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
              Uploading {fileName}...
            </p>
            {/* Progress bar */}
            <div style={{
              width:        "200px",
              height:       "6px",
              background:   "#E5E7EB",
              borderRadius: "999px",
              overflow:     "hidden",
              margin:       "10px auto 0",
            }}>
              <div style={{
                height:       "6px",
                width:        `${progress}%`,
                background:   "#2563EB",
                borderRadius: "999px",
                transition:   "width .2s ease",
              }} />
            </div>
            <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>{progress}%</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
              {isDragging ? "Drop your PDF here" : "Drag & drop your PDF"}
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280" }}>
              or <span style={{ color: "#2563EB", fontWeight: 500 }}>click to browse</span>
            </p>
            <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px" }}>
              PDF only · Max {MAX_SIZE_MB}MB
            </p>
          </>
        )}
      </div>

      {/* Error message */}
      {isError && errorMsg && (
        <div style={{
          display:      "flex",
          alignItems:   "flex-start",
          gap:          "8px",
          marginTop:    "10px",
          padding:      "10px 12px",
          background:   "#FEF2F2",
          border:       "1px solid #FECACA",
          borderRadius: "8px",
          fontSize:     "13px",
          color:        "#DC2626",
        }}>
          <span style={{ flexShrink: 0 }}>⚠</span>
          <div>
            {errorMsg}
            <button
              onClick={reset}
              style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "#DC2626", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}
            >
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
