"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { History, SearchX, Copy, Check, RefreshCw } from "lucide-react";
import { useAppToast } from "@/hooks/use-app-toast";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { Skeleton } from "@/components/ui/skeleton";

function HistoryListSkeleton() {
  return (
    <div
      className="flex flex-col gap-2"
      aria-busy="true"
      aria-label="Loading history"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card rounded-xl overflow-hidden border border-border"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
            <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1 min-w-0 max-w-md" />
            <Skeleton className="h-3 w-14 shrink-0" />
            <Skeleton className="h-8 w-14 shrink-0 rounded-lg" />
            <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface HistoryItem {
  id: string;
  platform: string;
  content: string;
  input_type: string;
  created_at: string;
  job_id: string;
  /** Original source text or URL from the repurpose job (for “Repurpose again”). */
  source_prefill?: string;
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
  tiktok:         "TikTok",
  whatsapp_status:"WhatsApp",
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin:       "#0A66C2",
  twitter_thread: "#1D9BF0",
  twitter_single: "#1D9BF0",
  twitter:        "#1D9BF0",
  instagram:      "#E1306C",
  facebook:       "#1877F2",
  reddit:         "#FF4500",
  email:          "#059669",
  tiktok:         "#FE2C55",
  whatsapp_status:"#25D366",
};

export default function HistoryPage() {
  const router = useRouter();
  const toastT = useAppToast();
  const [items,    setItems]    = useState<HistoryItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState("");
  const [platform, setPlatform] = useState("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  async function loadHistory() {
    try {
      const r = await fetch("/api/history", { cache: "no-store" });
      const d = (await r.json()) as {
        items?: HistoryItem[];
      };
      setItems(d.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const availablePlatforms = useMemo(() => {
    const seen = new Set<string>();
    items.forEach((i) => seen.add(i.platform));
    return Array.from(seen);
  }, [items]);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    const outputIds = Array.from(selected);
    setDeleting(true);
    try {
      const res = await fetch("/api/history/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outputIds }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        deleted?: number;
        requested?: number;
      };
      if (!res.ok) {
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.failedDelete"
        );
        return;
      }
      const deleted = data.deleted ?? 0;
      const requested = data.requested ?? outputIds.length;
      setSelected(new Set());
      setExpanded(new Set());
      await loadHistory();
      if (deleted < requested) {
        toastT.error("toast.partialDelete", { deleted, requested });
      } else {
        toastT.success("toast.deletedItems", { count: deleted });
      }
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setDeleting(false);
    }
  }

  async function copyContent(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyAllOutputsForJob(jobId: string) {
    const bundle = items
      .filter((i) => i.job_id === jobId)
      .map((i) => i.content.trim())
      .filter(Boolean);
    const text = bundle.join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedJobId(jobId);
    window.setTimeout(() => setCopiedJobId(null), 1500);
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground mb-1">History</h1>
            <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""} total</p>
          </div>
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="px-4 py-2 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm font-semibold cursor-pointer hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting..." : `Delete ${selected.size} selected`}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full py-2.5 pl-9 pr-9 rounded-xl border bg-card text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer text-lg leading-none">×</button>
          )}
        </div>

        {/* Platform filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {["all", ...availablePlatforms].map((p) => {
            const active = platform === p;
            const color  = active ? (p === "all" ? "#2563EB" : (PLATFORM_COLORS[p] ?? "#2563EB")) : undefined;
            return (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-colors ${
                  active
                    ? "font-semibold border-[1.5px]"
                    : "font-normal border text-muted-foreground border-border hover:bg-muted/50"
                }`}
                style={active ? { borderColor: `${color}60`, background: `${color}15`, color } : undefined}
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
          <div className="flex items-center gap-2.5 mb-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="cursor-pointer accent-primary"
            />
            <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <HistoryListSkeleton />
        ) : filtered.length === 0 ? (
          query || platform !== "all" ? (
            <DashboardEmptyState
              icon={SearchX}
              title="No results found"
              description="Try another search term or clear filters to see all history."
              action={{
                label: "Clear filters",
                onClick: () => {
                  setQuery("");
                  setPlatform("all");
                },
              }}
            />
          ) : (
            <DashboardEmptyState
              icon={History}
              title="No history yet"
              description="Repurpose content from the studio and every output will show up here."
              action={{ label: "Start repurposing", href: "/dashboard/repurpose" }}
            />
          )
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item) => {
              const isOpen     = expanded.has(item.id);
              const isSelected = selected.has(item.id);
              const color      = PLATFORM_COLORS[item.platform] ?? "#6B7280";
              const label      = PLATFORM_LABELS[item.platform] ?? item.platform;
              const preview    = item.content.slice(0, 120) + (item.content.length > 120 ? "…" : "");

              return (
                <div key={item.id} className={`bg-card rounded-xl overflow-hidden border transition-colors ${isSelected ? "border-primary/30" : "border-border"}`}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} onClick={(e) => e.stopPropagation()} className="cursor-pointer shrink-0 accent-primary" />
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap"
                      style={{ background: `${color}15`, color }}
                    >
                      {label}
                    </span>
                    <span onClick={() => toggleExpand(item.id)} className="flex-1 text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">
                      {preview}
                    </span>
                    <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void copyAllOutputsForJob(item.job_id);
                      }}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      aria-label="Copy all outputs for this repurpose"
                      title="Copy all platforms for this run"
                    >
                      {copiedJobId === item.job_id ? (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const src = (item.source_prefill ?? "").trim();
                        if (!src) return;
                        try { sessionStorage.setItem("repostai_prefill", src); } catch {}
                        router.push("/dashboard?prefill=1");
                      }}
                      disabled={!(item.source_prefill ?? "").trim()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      aria-label="Repurpose again with original source"
                      title="Repurpose again"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => copyContent(item.id, item.content)}
                      className={`ro-copy-btn ${copied === item.id ? "[data-copied]" : ""}`}
                      data-copied={copied === item.id || undefined}
                    >
                      {copied === item.id ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="text-muted-foreground cursor-pointer text-base leading-none shrink-0 transition-transform"
                      style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      ▾
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 pl-11 border-t border-border">
                      <pre className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words font-serif mt-3">
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
