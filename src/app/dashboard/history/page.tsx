"use client";
// FIX: removed unused useCallback import
// FIX: removed unused expressions on lines 83 and 91 (onFilter side-effect calls)

import { useState, useEffect, useMemo } from "react";

interface HistoryItem {
  id:         string;
  platform:   string;
  content:    string;
  input_type: string;
  created_at: string;
  job_id:     string;
}

const PLATFORM_LABELS: Record<string, string> = {
  linkedin:       "LinkedIn",
  twitter_thread: "Twitter / X Thread",
  twitter_single: "Twitter / X Post",
  twitter:        "Twitter / X",
  instagram:      "Instagram",
  facebook:       "Facebook",
  reddit:         "Reddit",
  email:          "Email",
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin:       "#0A66C2",
  twitter_thread: "#0F172A",
  twitter_single: "#0F172A",
  twitter:        "#0F172A",
  instagram:      "#C13584",
  facebook:       "#1877F2",
  reddit:         "#FF4500",
  email:          "#059669",
};

export default function HistoryPage() {
  const [items,    setItems]    = useState<HistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");
  const [platform, setPlatform] = useState("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [copied,   setCopied]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        setItems((d as { items?: HistoryItem[] }).items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const availablePlatforms = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((i) => seen.add(i.platform));
    return Array.from(seen);
  }, [items]);

  // FIX: removed onFilter side-effect call — filter result used directly in JSX
  const filtered = useMemo(() => {
    let result = items;
    if (platform !== "all") {
      result = result.filter((i) => i.platform === platform);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (i) =>
          i.content.toLowerCase().includes(q) ||
          (PLATFORM_LABELS[i.platform] ?? i.platform).toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, query, platform]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  async function handleDeleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} item${selected.size !== 1 ? "s" : ""}?`)) return;
    setDeleting(true);
    await Promise.all(
      Array.from(selected).map((id) =>
        fetch(`/api/history?id=${id}`, { method: "DELETE" })
      )
    );
    setItems((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    setDeleting(false);
  }

  async function copyContent(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{
      minHeight:  "100vh",
      background: "#F9FAFB",
      padding:    "40px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>History</h1>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>{items.length} item{items.length !== 1 ? "s" : ""} total</p>
          </div>
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
            >
              {deleting ? "Deleting..." : `Delete ${selected.size} selected`}
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history..."
            style={{ width: "100%", padding: "10px 36px", borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "13px", color: "#111827", background: "#FFFFFF", outline: "none", boxSizing: "border-box" }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
          )}
        </div>

        {/* Platform filter chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {["all", ...availablePlatforms].map((p) => {
            const active = platform === p;
            const color  = active ? (p === "all" ? "#2563EB" : (PLATFORM_COLORS[p] ?? "#2563EB")) : "#9CA3AF";
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                style={{ padding: "5px 12px", borderRadius: "999px", border: active ? `1.5px solid ${color}` : "1px solid #E5E7EB", background: active ? color + "15" : "transparent", color: active ? color : "#6B7280", fontSize: "12px", fontWeight: active ? 600 : 400, cursor: "pointer" }}
              >
                {p === "all"
                  ? `All (${items.length})`
                  : `${PLATFORM_LABELS[p] ?? p} (${items.filter((i) => i.platform === p).length})`}
              </button>
            );
          })}
        </div>

        {/* Select all */}
        {filtered.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontSize: "13px", color: "#6B7280" }}>
            <input
              type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              style={{ cursor: "pointer" }}
            />
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#9CA3AF", fontSize: "14px" }}>Loading history...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#FFFFFF", border: "1px dashed #E5E7EB", borderRadius: "14px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              {query || platform !== "all" ? "No results found" : "No history yet"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {query || platform !== "all" ? "Try a different search or filter" : "Your repurposed content will appear here"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((item) => {
              const isOpen     = expanded.has(item.id);
              const isSelected = selected.has(item.id);
              const color      = PLATFORM_COLORS[item.platform] ?? "#6B7280";
              const label      = PLATFORM_LABELS[item.platform] ?? item.platform;
              const preview    = item.content.slice(0, 120) + (item.content.length > 120 ? "…" : "");

              return (
                <div key={item.id} style={{ background: "#FFFFFF", border: isSelected ? `1.5px solid ${color}40` : "1px solid #E5E7EB", borderRadius: "12px", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} onClick={(e) => e.stopPropagation()} style={{ cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "999px", background: color + "15", color, flexShrink: 0, whiteSpace: "nowrap" }}>
                      {label}
                    </span>
                    <span onClick={() => toggleExpand(item.id)} style={{ flex: 1, fontSize: "13px", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                      {preview}
                    </span>
                    <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <button
                      onClick={() => copyContent(item.id, item.content)}
                      style={{ padding: "4px 10px", borderRadius: "6px", border: copied === item.id ? "0.5px solid #86EFAC" : "0.5px solid #E5E7EB", background: copied === item.id ? "#F0FDF4" : "transparent", color: copied === item.id ? "#16A34A" : "#9CA3AF", fontSize: "11px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
                    >
                      {copied === item.id ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={() => toggleExpand(item.id)} style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "16px", lineHeight: 1, flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .2s" }}>
                      ▾
                    </button>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "14px 16px 16px 44px", borderTop: "0.5px solid #F3F4F6" }}>
                      <pre style={{ fontSize: "13px", lineHeight: 1.75, color: "#1E293B", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "Georgia, serif", margin: 0 }}>
                        {item.content}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
