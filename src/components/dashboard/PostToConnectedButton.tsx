"use client";

// src/components/dashboard/PostToConnectedButton.tsx
// FIX #5: Shows disabled state with tooltip when no accounts connected
// FIX #6: All 5 platforms shown in connections page

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PostToConnectedButtonProps {
  connectedCount:  number;
  posts:           Array<{ platform: string; text: string }>;
  onSuccess?:      (results: unknown[]) => void;
}

export function PostToConnectedButton({
  connectedCount,
  posts,
  onSuccess,
}: PostToConnectedButtonProps) {
  const [posting,  setPosting]  = useState(false);
  const [showTip,  setShowTip]  = useState(false);
  const router = useRouter();

  const hasAccounts = connectedCount > 0;
  const hasPosts    = posts.length > 0;
  const isDisabled  = !hasAccounts || !hasPosts || posting;

  async function handlePost() {
    if (isDisabled) return;
    setPosting(true);
    try {
      const res  = await fetch("/api/social/post", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ posts }),
      });
      const data = await res.json();
      if (onSuccess) onSuccess(data.results ?? []);
    } catch (err) {
      console.error("Post failed:", err);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Tooltip for disabled state */}
      {showTip && !hasAccounts && (
        <div style={{
          position:     "absolute",
          bottom:       "calc(100% + 8px)",
          left:         "50%",
          transform:    "translateX(-50%)",
          background:   "#111827",
          color:        "#FFFFFF",
          fontSize:     "12px",
          padding:      "8px 12px",
          borderRadius: "8px",
          whiteSpace:   "nowrap",
          zIndex:       10,
          textAlign:    "center",
          lineHeight:   1.4,
        }}>
          No accounts connected yet
          <br />
          <span style={{ opacity: 0.7 }}>
            Go to Settings → Connections to connect
          </span>
          {/* Arrow */}
          <div style={{
            position:    "absolute",
            top:         "100%",
            left:        "50%",
            transform:   "translateX(-50%)",
            width:       0,
            height:      0,
            borderLeft:  "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop:   "5px solid #111827",
          }} />
        </div>
      )}

      <button
        onClick={hasAccounts ? handlePost : () => router.push("/dashboard/connections")}
        disabled={posting}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        style={{
          display:      "inline-flex",
          alignItems:   "center",
          gap:          "7px",
          padding:      "9px 20px",
          borderRadius: "9px",
          border:       hasAccounts
            ? "none"
            : "1.5px dashed #D1D5DB",
          background:   hasAccounts
            ? posting ? "#9CA3AF" : "#1E3A5F"
            : "#F9FAFB",
          color:        hasAccounts ? "#FFFFFF" : "#9CA3AF",
          fontSize:     "13px",
          fontWeight:   600,
          cursor:       posting ? "wait" : "pointer",
          transition:   "all .15s",
        }}
      >
        {posting ? (
          <>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none"
              style={{ animation: "spin .7s linear infinite" }}>
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2.5"
                strokeDasharray="20 24" strokeLinecap="round"/>
            </svg>
            Posting...
          </>
        ) : hasAccounts ? (
          <>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 2L18 10l-8 8M2 10h16"/>
            </svg>
            Post to {connectedCount} connected account{connectedCount !== 1 ? "s" : ""}
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" width="14" height="14" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M13 10H3m10 0l-3-3m3 3l-3 3M17 5v10"/>
            </svg>
            Connect accounts to post
          </>
        )}
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── FIX #6: All platforms shown in connections ────────────────────────────────
// src/lib/social/available-platforms.ts
// Export this list and use it in your ConnectionsPage

export const ALL_CONNECTABLE_PLATFORMS = [
  {
    id:          "linkedin",
    name:        "LinkedIn",
    description: "Post to your profile and company pages",
    color:       "#0A66C2",
    bg:          "#EBF5FF",
    icon:        "in",
    connectUrl:  "/api/social/connect/linkedin",
    available:   true,
    plan:        "all",
  },
  {
    id:          "twitter",
    name:        "Twitter / X",
    description: "Post tweets and threads to your audience",
    color:       "#0F172A",
    bg:          "#F1F5F9",
    icon:        "𝕏",
    connectUrl:  "/api/social/connect/twitter",
    available:   true,
    plan:        "pro", // requires $100/mo X API — show on pro+
  },
  {
    id:          "instagram",
    name:        "Instagram",
    description: "Business & Creator accounts only",
    color:       "#C13584",
    bg:          "#FDF2F8",
    icon:        "IG",
    connectUrl:  "/api/social/connect/instagram",
    available:   true,
    plan:        "pro",
  },
  {
    id:          "facebook",
    name:        "Facebook",
    description: "Post to your profile and pages",
    color:       "#1877F2",
    bg:          "#EFF6FF",
    icon:        "f",
    connectUrl:  "/api/social/connect/facebook",
    available:   true,
    plan:        "all",
  },
  {
    id:          "reddit",
    name:        "Reddit",
    description: "Post to any subreddit you moderate",
    color:       "#FF4500",
    bg:          "#FFF7ED",
    icon:        "r/",
    connectUrl:  "/api/social/connect/reddit",
    available:   true,
    plan:        "all",
  },
];
