"use client";

// src/components/dashboard/HistorySearch.tsx
// FIX #4: Search + platform filter for history page

import { useState, useMemo } from "react";
import { getPlatformLabel }  from "@/lib/platform-display";

interface HistoryItem {
  id:         string;
  platform:   string;
  content:    string;
  created_at: string;
}

interface HistorySearchProps {
  items:     HistoryItem[];
  onFilter:  (filtered: HistoryItem[]) => void;
}

const FILTER_PLATFORMS = [
  "all", "linkedin", "twitter_thread", "twitter_single",
  "instagram", "facebook", "reddit", "email",
];

export function HistorySearch({ items, onFilter }: HistorySearchProps) {
  const [query,    setQuery]    = useState("");
  const [platform, setPlatform] = useState("all");

  const filtered = useMemo(() => {
    let result = items;
    if (platform !== "all") {
      result = result.filter((i) => i.platform === platform);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((i) =>
        i.content.toLowerCase().includes(q) ||
        i.platform.toLowerCase().includes(q)
      );
    }
    // Notify parent
    onFilter(result);
    return result;
  }, [query, platform, items, onFilter]);

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Search input */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <svg
            viewBox="0 0 20 20" width="16" height="16" fill="none"
            stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your history..."
            style={{
              width:        "100%",
              padding:      "9px 12px 9px 36px",
              borderRadius: "9px",
              border:       "1px solid #E5E7EB",
              fontSize:     "13px",
              color:        "#111827",
              outline:      "none",
              background:   "#FFFFFF",
              boxSizing:    "border-box",
            }}
            onFocus={(e)  => { e.target.style.borderColor = "#BFDBFE"; }}
            onBlur={(e)   => { e.target.style.borderColor = "#E5E7EB"; }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position:   "absolute",
                right:      "10px",
                top:        "50%",
                transform:  "translateY(-50%)",
                background: "transparent",
                border:     "none",
                color:      "#9CA3AF",
                cursor:     "pointer",
                fontSize:   "16px",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Result count */}
        <div style={{
          display:    "flex",
          alignItems: "center",
          fontSize:   "13px",
          color:      "#9CA3AF",
          whiteSpace: "nowrap",
        }}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Platform filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {FILTER_PLATFORMS.map((p) => {
          const active = platform === p;
          return (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              style={{
                padding:      "5px 12px",
                borderRadius: "999px",
                border:       active ? "1.5px solid #2563EB" : "1px solid #E5E7EB",
                background:   active ? "#EFF6FF" : "transparent",
                color:        active ? "#2563EB" : "#6B7280",
                fontSize:     "12px",
                fontWeight:   active ? 600 : 400,
                cursor:       "pointer",
                transition:   "all .15s",
              }}
            >
              {p === "all" ? "All platforms" : getPlatformLabel(p)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── FIX #8: Analytics empty state CTA ────────────────────────────────────────
// src/components/dashboard/AnalyticsEmptyState.tsx

export function AnalyticsEmptyState() {
  return (
    <div style={{
      textAlign:    "center",
      padding:      "48px 24px",
      background:   "#FFFFFF",
      border:       "1px dashed #E5E7EB",
      borderRadius: "14px",
    }}>
      {/* Icon */}
      <div style={{
        width:          "56px",
        height:         "56px",
        borderRadius:   "14px",
        background:     "#EFF6FF",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        margin:         "0 auto 16px",
      }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
          stroke="#2563EB" strokeWidth="2" strokeLinecap="round">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
        No analytics yet
      </h3>
      <p style={{
        fontSize:     "14px",
        color:        "#6B7280",
        lineHeight:   1.6,
        marginBottom: "20px",
        maxWidth:     "340px",
        margin:       "0 auto 20px",
      }}>
        Start repurposing content and connecting social accounts to track performance
        across all your platforms.
      </p>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href="/dashboard/repurpose"
          style={{
            padding:        "9px 20px",
            borderRadius:   "8px",
            background:     "#1E3A5F",
            color:          "#FFFFFF",
            fontSize:       "13px",
            fontWeight:     600,
            textDecoration: "none",
          }}
        >
          Start repurposing
        </a>
        <a
          href="/dashboard/connections"
          style={{
            padding:        "9px 20px",
            borderRadius:   "8px",
            border:         "1px solid #E5E7EB",
            background:     "transparent",
            color:          "#374151",
            fontSize:       "13px",
            fontWeight:     500,
            textDecoration: "none",
          }}
        >
          Connect accounts
        </a>
      </div>
    </div>
  );
}

// ── FIX #11: Platform score with improvement tips ─────────────────────────────
// src/components/dashboard/PlatformScore.tsx

interface PlatformScoreProps {
  platform: string;
  score:    number; // 0-10
}

const IMPROVEMENT_TIPS: Record<string, string[]> = {
  linkedin: [
    "Start with a hook in the first 2 lines before 'see more'",
    "Add 3-5 relevant hashtags at the end",
    "End with a question to drive comments",
  ],
  instagram: [
    "Shorten the first line — only 2 lines show before 'more'",
    "Add visual descriptions to trigger saves",
    "Use 8-15 hashtags placed after dots on new lines",
    "Add a clear CTA: 'Save this for later' or 'Drop a comment below'",
  ],
  twitter_thread: [
    "Make tweet 1 work as a standalone — it's the hook",
    "Each tweet must be under 280 chars",
    "Number tweets: '2/' '3/' etc.",
  ],
  twitter_single: [
    "Keep it under 260 chars for maximum reach",
    "Remove hashtags — they reduce engagement on single tweets",
    "End with a question or bold claim",
  ],
  reddit: [
    "Remove any self-promotional language",
    "Lead with value — the lesson or insight first",
    "End with an open question, not a CTA",
  ],
  email: [
    "Make the subject line more specific — avoid vague openers",
    "Cut the opening paragraph — get to the point faster",
    "Have ONE clear CTA, not multiple",
  ],
  facebook: [
    "End with an easy question — 'Have you experienced this?'",
    "Add line breaks every 2-3 lines for readability",
    "Don't include links in the post — put them in first comment",
  ],
};

function getScoreColor(score: number): string {
  if (score >= 8) return "#16A34A";
  if (score >= 6) return "#D97706";
  return "#DC2626";
}

function getScoreLabel(score: number): string {
  if (score >= 8.5) return "Excellent";
  if (score >= 7)   return "Good";
  if (score >= 5.5) return "Consider";
  return "Needs work";
}

export function PlatformScore({ platform, score }: PlatformScoreProps) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const tips  = IMPROVEMENT_TIPS[platform] ?? [];
  const showTips = score < 8 && tips.length > 0;

  return (
    <div style={{
      background:   "#FFFFFF",
      border:       "0.5px solid #E5E7EB",
      borderRadius: "10px",
      padding:      "14px 16px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: showTips ? "10px" : 0 }}>
        {/* Score circle */}
        <div style={{
          width:          "40px",
          height:         "40px",
          borderRadius:   "50%",
          background:     color + "15",
          border:         `2px solid ${color}`,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          flexShrink:     0,
          fontSize:       "13px",
          fontWeight:     700,
          color,
        }}>
          {score.toFixed(1)}
        </div>

        <div style={{ flex: 1 }}>
          {/* FIX #10: Use getPlatformLabel for consistent naming */}
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "2px" }}>
            {getPlatformLabel(platform)}
          </div>
          <span style={{
            fontSize:     "11px",
            fontWeight:   600,
            padding:      "2px 7px",
            borderRadius: "999px",
            background:   color + "15",
            color,
          }}>
            {label}
          </span>
        </div>
      </div>

      {/* FIX #11: Show improvement tips for sub-8 scores */}
      {showTips && (
        <div style={{
          paddingTop:  "10px",
          borderTop:   "0.5px solid #F3F4F6",
          marginTop:   "2px",
        }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase", letterSpacing: ".05em" }}>
            Tips to improve
          </p>
          {tips.map((tip, i) => (
            <div key={i} style={{
              display:    "flex",
              gap:        "7px",
              fontSize:   "12px",
              color:      "#374151",
              marginBottom: "4px",
              lineHeight: 1.5,
            }}>
              <span style={{ color: "#D97706", flexShrink: 0 }}>→</span>
              {tip}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
