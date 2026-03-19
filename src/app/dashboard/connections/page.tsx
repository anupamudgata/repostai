"use client";

import { useState, useEffect }  from "react";
import { useUserPlan }          from "@/hooks/useUserPlan";

interface ConnectedAccount {
  platform:         string;
  platformUsername: string;
  platformAvatar:   string | null;
  tokenExpiresAt:   string | null;
  status:           "connected" | "expired";
}

const PLATFORMS = [
  {
    id:           "linkedin",
    name:         "LinkedIn",
    description:  "Post to your profile and company pages",
    color:        "#0A66C2",
    bg:           "#EBF5FF",
    border:       "#BFDBFE",
    icon:         "in",
    connectUrl:   "/api/social/connect/linkedin",
    requiredPlan: "free" as const,
  },
  {
    id:           "facebook",
    name:         "Facebook",
    description:  "Post to your profile and Facebook pages",
    color:        "#1877F2",
    bg:           "#EFF6FF",
    border:       "#BFDBFE",
    icon:         "f",
    connectUrl:   "/api/social/connect/facebook",
    requiredPlan: "free" as const,
  },
  {
    id:           "reddit",
    name:         "Reddit",
    description:  "Post to any subreddit you moderate",
    color:        "#FF4500",
    bg:           "#FFF7ED",
    border:       "#FED7AA",
    icon:         "r/",
    connectUrl:   "/api/social/connect/reddit",
    requiredPlan: "free" as const,
  },
  {
    id:           "twitter",
    name:         "Twitter / X",
    description:  "Post tweets and threads",
    color:        "#0F172A",
    bg:           "#F1F5F9",
    border:       "#CBD5E1",
    icon:         "𝕏",
    connectUrl:   "/api/social/connect/twitter",
    requiredPlan: "pro" as const,
  },
  {
    id:           "instagram",
    name:         "Instagram",
    description:  "Business & Creator accounts only",
    color:        "#C13584",
    bg:           "#FDF2F8",
    border:       "#FBCFE8",
    icon:         "IG",
    connectUrl:   "/api/social/connect/instagram",
    requiredPlan: "pro" as const,
  },
];

export default function ConnectionsPage() {
  const { plan }                = useUserPlan();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [toast,    setToast]    = useState("");

  // FIX: declare showToast BEFORE useEffect so it's hoisted correctly
  // Using useCallback pattern with regular function declaration at top scope
  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  useEffect(() => {
    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []))
      .catch(() => {});

    const params    = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error     = params.get("error");

    if (connected) {
      showToast(
        `${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`
      );
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (error) {
      showToast("Connection failed. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDisconnect(platformId: string) {
    if (!confirm(`Disconnect ${platformId}?`)) return;
    const res = await fetch(`/api/social/accounts?platform=${platformId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setAccounts((prev) => prev.filter((a) => a.platform !== platformId));
      showToast(`${platformId} disconnected.`);
    }
  }

  const connectedCount = accounts.filter((a) => a.status === "connected").length;

  return (
    <div style={{
      minHeight:  "100vh",
      background: "#F9FAFB",
      padding:    "40px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:     "fixed",
          top:          "20px",
          left:         "50%",
          transform:    "translateX(-50%)",
          zIndex:       999,
          background:   "#111827",
          color:        "#FFFFFF",
          padding:      "11px 20px",
          borderRadius: "10px",
          fontSize:     "13px",
          fontWeight:   500,
          boxShadow:    "0 4px 16px rgba(0,0,0,.2)",
        }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: "680px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>
            Connections
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            Connect your social accounts to enable one-click posting.
            {connectedCount > 0 && (
              <span style={{ color: "#16A34A", fontWeight: 500 }}>
                {" "}{connectedCount} account{connectedCount !== 1 ? "s" : ""} connected.
              </span>
            )}
          </p>
        </div>

        {/* Platform cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PLATFORMS.map((platform) => {
            const account     = accounts.find((a) => a.platform === platform.id);
            const isConnected = account?.status === "connected";
            const isExpired   = account?.status === "expired";
            const isLocked    = platform.requiredPlan === "pro" && plan === "free";

            return (
              <div
                key={platform.id}
                style={{
                  background:   "#FFFFFF",
                  border:       isConnected
                    ? `1.5px solid ${platform.border}`
                    : isExpired
                    ? "1.5px solid #FEF3C7"
                    : "1px solid #E5E7EB",
                  borderRadius: "14px",
                  padding:      "18px",
                  position:     "relative",
                  overflow:     "hidden",
                }}
              >
                {/* Connected accent */}
                {isConnected && (
                  <div style={{
                    position:     "absolute",
                    top: 0, left: 0, right: 0,
                    height:       "3px",
                    background:   platform.color,
                    borderRadius: "14px 14px 0 0",
                  }} />
                )}

                {/* Pro lock overlay */}
                {isLocked && (
                  <div style={{
                    position:       "absolute",
                    inset:          0,
                    background:     "rgba(255,255,255,0.88)",
                    backdropFilter: "blur(2px)",
                    borderRadius:   "14px",
                    display:        "flex",
                    flexDirection:  "column",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            "8px",
                    zIndex:         10,
                  }}>
                    <span style={{
                      fontSize:     "11px",
                      fontWeight:   700,
                      padding:      "5px 14px",
                      borderRadius: "999px",
                      background:   "#1E3A5F",
                      color:        "#FFFFFF",
                    }}>
                      ⚡ Pro plan required
                    </span>
                    <a
                      href="/pricing"
                      style={{ fontSize: "12px", color: "#2563EB", textDecoration: "underline" }}
                    >
                      Upgrade to unlock →
                    </a>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {/* Icon */}
                  <div style={{
                    width:          "44px",
                    height:         "44px",
                    borderRadius:   "12px",
                    background:     isConnected ? platform.color : platform.bg,
                    color:          isConnected ? "#FFFFFF" : platform.color,
                    fontSize:       "13px",
                    fontWeight:     800,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    flexShrink:     0,
                    fontFamily:     "monospace",
                  }}>
                    {platform.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                        {platform.name}
                      </span>
                      {isConnected && (
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "999px", background: "#DCFCE7", color: "#166534" }}>
                          ✓ Connected
                        </span>
                      )}
                      {isExpired && (
                        <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: "999px", background: "#FEF3C7", color: "#92400E" }}>
                          ⚠ Token expired
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
                      {account ? `@${account.platformUsername}` : platform.description}
                    </p>
                  </div>

                  {/* Action */}
                  <div style={{ flexShrink: 0 }}>
                    {!account ? (
                      <a
                        href={platform.connectUrl}
                        style={{
                          display:        "inline-flex",
                          alignItems:     "center",
                          padding:        "8px 16px",
                          borderRadius:   "8px",
                          border:         `1.5px solid ${platform.color}`,
                          background:     "transparent",
                          color:          platform.color,
                          fontSize:       "12px",
                          fontWeight:     600,
                          textDecoration: "none",
                        }}
                      >
                        Connect
                      </a>
                    ) : isExpired ? (
                      <a
                        href={platform.connectUrl}
                        style={{
                          display:        "inline-flex",
                          padding:        "8px 14px",
                          borderRadius:   "8px",
                          border:         "1.5px solid #F59E0B",
                          background:     "#FFFBEB",
                          color:          "#92400E",
                          fontSize:       "12px",
                          fontWeight:     600,
                          textDecoration: "none",
                        }}
                      >
                        Reconnect
                      </a>
                    ) : (
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        style={{
                          padding:      "7px 13px",
                          borderRadius: "8px",
                          border:       "1px solid #E5E7EB",
                          background:   "transparent",
                          color:        "#9CA3AF",
                          fontSize:     "12px",
                          cursor:       "pointer",
                        }}
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security note */}
        <div style={{
          marginTop:    "24px",
          padding:      "14px 16px",
          background:   "#FFFFFF",
          border:       "0.5px solid #E5E7EB",
          borderRadius: "10px",
          fontSize:     "12px",
          color:        "#6B7280",
          lineHeight:   1.6,
        }}>
          🔒 Tokens are stored encrypted. We only post when you explicitly click
          &ldquo;Post to platforms&rdquo; — never automatically.
        </div>
      </div>
    </div>
  );
}
