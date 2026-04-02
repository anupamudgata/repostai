"use client";

import { useState, useEffect, useRef } from "react";
import { Lock } from "lucide-react";
import { useRepurposeStream } from "@/hooks/useRepurposeStream";
import { RepurposeOutput }    from "@/components/dashboard/RepurposeOutput";
import type { Platform, Language }      from "@/lib/ai/types";
import { FREE_PLATFORM_IDS } from "@/config/constants";

const ALL_PLATFORMS: Platform[] = ["linkedin","twitter_thread","twitter_single","instagram","facebook","reddit","email","tiktok","whatsapp_status"];
const PLATFORM_LABELS: Record<Platform, string> = { linkedin: "LinkedIn", twitter_thread: "X Thread", twitter_single: "X Post", instagram: "Instagram", facebook: "Facebook", reddit: "Reddit", email: "Email", tiktok: "TikTok", whatsapp_status: "WhatsApp" };
const PLATFORM_COLORS: Record<Platform, string> = { linkedin: "#0A66C2", twitter_thread: "#1D9BF0", twitter_single: "#1D9BF0", instagram: "#E1306C", facebook: "#1877F2", reddit: "#FF4500", email: "#059669", tiktok: "#FE2C55", whatsapp_status: "#25D366" };

const FREE_PLATFORMS_SET = new Set<string>(FREE_PLATFORM_IDS);

/** All four free-tier platforms — default must not include Starter+ only IDs or /api/repurpose/stream rejects free users. */
const DEFAULT_PLATFORMS: Platform[] = [...FREE_PLATFORM_IDS];

export default function RepurposePage() {
  const { state, start, cancel, reset } = useRepurposeStream();
  const [content,            setContent]            = useState("");
  const [selectedPlatforms,  setSelectedPlatforms]  = useState<Platform[]>(DEFAULT_PLATFORMS);
  const [language,           setLanguage]           = useState<Language>("en");
  const languageRef = useRef<Language>("en");
  const [inputType,          setInputType]          = useState<"text"|"url"|"youtube">("text");
  const [userPlan,           setUserPlan]           = useState<string | null>(null);
  const [connectedAccounts,  setConnectedAccounts]  = useState<string[]>([]);

  const planLoading = userPlan === null;
  const isFreePlan = userPlan === "free";
  const isRunning = state.status === "extracting" || state.status === "streaming";
  const hasOutput = state.status === "done" || Object.values(state.platforms).some((p) => p.status !== "idle" && p.status !== "waiting");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d: { plan?: string }) => {
        const plan = d.plan ?? "free";
        setUserPlan(plan);
        if (plan === "free") {
          setSelectedPlatforms((prev) => prev.filter((p) => FREE_PLATFORMS_SET.has(p)));
        }
      })
      .catch(() => { setUserPlan("free"); });

    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((d: { accounts?: { platform: string; status: string }[] }) => {
        const connected = (d.accounts ?? []).filter((a) => a.status === "connected").map((a) => a.platform);
        setConnectedAccounts(connected);
      })
      .catch(() => {});
  }, []);

  function togglePlatform(p: Platform) {
    if (isFreePlan && !FREE_PLATFORMS_SET.has(p)) return;
    setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function handleSubmit() {
    if (!content.trim() || selectedPlatforms.length === 0) return;
    languageRef.current = language;
    await start({ content, platforms: selectedPlatforms, language: languageRef.current, inputType });
  }

  return (
    <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "36px 24px", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>

      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>Repurpose content</h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF" }}>Paste your content, pick platforms, get platform-native posts in seconds.</p>
      </div>

      {!hasOutput && (
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "16px", overflow: "hidden", marginBottom: "24px", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          {/* Input type tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #F1F5F9", background: "#FAFAFA" }}>
            {(["text","url","youtube"] as const).map((type) => (
              <button key={type} onClick={() => setInputType(type)} style={{ padding: "12px 20px", fontSize: "13px", fontWeight: inputType === type ? 600 : 400, color: inputType === type ? "#1E3A5F" : "#94A3B8", background: "transparent", border: "none", borderBottom: inputType === type ? "2px solid #1E3A5F" : "2px solid transparent", cursor: "pointer", transition: "all .15s", textTransform: "capitalize" }}>
                {type === "youtube" ? "YouTube" : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Content input */}
          <div style={{ padding: "16px" }}>
            <textarea
              value={content} onChange={(e) => setContent(e.target.value)} disabled={isRunning}
              placeholder={inputType === "text" ? "Paste your blog post, article, or any text here..." : inputType === "url" ? "https://yourblog.com/post-title" : "https://youtube.com/watch?v=..."}
              rows={inputType === "text" ? 8 : 3}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", fontSize: "14px", lineHeight: 1.7, color: "#1E293B", background: isRunning ? "#F9FAFB" : "#FFFFFF", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color .15s" }}
              onFocus={(e) => { e.target.style.borderColor = "#BFDBFE"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#E5E7EB"; }}
            />
            {inputType === "text" && <div style={{ textAlign: "right", fontSize: "11px", color: "#CBD5E1", marginTop: "4px" }}>{content.length.toLocaleString()} characters</div>}
          </div>

          {/* Platform selector */}
          <div style={{ padding: "0 16px 16px", borderTop: "0.5px solid #F1F5F9", paddingTop: "14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: "10px" }}>Select platforms</div>
            {!planLoading && isFreePlan && (
              <p style={{ fontSize: "12px", color: "#64748B", marginBottom: "10px", lineHeight: 1.45 }}>
                Free plan: LinkedIn, X (thread + post), and Instagram. Upgrade to Starter or Pro for Facebook, Reddit, Email, and more.
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ALL_PLATFORMS.map((p) => {
                const selected = selectedPlatforms.includes(p);
                const color    = PLATFORM_COLORS[p];
                const locked   = !planLoading && isFreePlan && !FREE_PLATFORMS_SET.has(p);
                return (
                  <button
                    key={p}
                    type="button"
                    title={locked ? "Upgrade to Starter or Pro to use this platform" : undefined}
                    onClick={() => togglePlatform(p)}
                    disabled={isRunning || locked}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      border: selected ? `1.5px solid ${color}` : "1.5px solid #E5E7EB",
                      background: selected ? `${color}12` : "transparent",
                      color: selected ? color : "#94A3B8",
                      fontSize: "12px",
                      fontWeight: selected ? 600 : 400,
                      cursor: isRunning || locked ? "not-allowed" : "pointer",
                      opacity: locked ? 0.55 : 1,
                      transition: "all .15s",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {locked && <Lock style={{ width: 12, height: 12, flexShrink: 0 }} aria-hidden />}
                    {selected && !locked && <span style={{ fontSize: "9px" }}>✓</span>}
                    {PLATFORM_LABELS[p]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language + submit */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "#FAFAFA", borderTop: "1px solid #F1F5F9", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", color: "#94A3B8" }}>Language:</span>
              {(["en","hi","mr","bn","te","kn","or","pa","es","pt","fr"] as const).map((lang) => {
                const labels: Record<Language, string> = { en: "English", hi: "हिन्दी", mr: "मराठी", bn: "বাংলা", te: "తెలుగు", kn: "ಕನ್ನಡ", or: "ଓଡ଼ିଆ", pa: "ਪੰਜਾਬੀ", es: "Español", pt: "Português", fr: "Français" };
                return (
                  <button key={lang} onClick={() => setLanguage(lang)} disabled={isRunning}
                    style={{ padding: "5px 10px", borderRadius: "6px", border: language === lang ? "1.5px solid #1E3A5F" : "1px solid #E5E7EB", background: language === lang ? "#EFF6FF" : "transparent", color: language === lang ? "#1E3A5F" : "#94A3B8", fontSize: "11px", fontWeight: language === lang ? 600 : 400, cursor: "pointer", transition: "all .15s" }}>
                    {labels[lang]}
                  </button>
                );
              })}
            </div>
            <button onClick={handleSubmit} disabled={isRunning || planLoading || !content.trim() || selectedPlatforms.length === 0}
              style={{ padding: "10px 28px", borderRadius: "10px", border: "none", background: isRunning || planLoading || !content.trim() || selectedPlatforms.length === 0 ? "#E2E8F0" : "#1E3A5F", color: isRunning || planLoading || !content.trim() || selectedPlatforms.length === 0 ? "#94A3B8" : "#FFFFFF", fontSize: "14px", fontWeight: 700, cursor: isRunning ? "wait" : "pointer", transition: "all .15s", letterSpacing: "0.01em" }}>
              {isRunning ? `Generating ${selectedPlatforms.length} posts...` : `Repurpose for ${selectedPlatforms.length} platform${selectedPlatforms.length !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      )}

      {hasOutput && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>
              {isRunning ? `Generating posts for ${Object.values(state.platforms).length} platforms...` : `${Object.values(state.platforms).filter(p => p.status === "done").length} posts ready`}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {isRunning && <button onClick={cancel} style={{ padding: "7px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "transparent", color: "#6B7280", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>Cancel</button>}
              {state.status === "done" && <button onClick={reset} style={{ padding: "7px 16px", borderRadius: "8px", border: "none", background: "#1E3A5F", color: "#FFFFFF", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>+ New repurpose</button>}
            </div>
          </div>
          <RepurposeOutput status={state.status} platforms={state.platforms} totalMs={state.totalMs} remaining={state.remaining} error={state.error} progress={state.progress} onReset={reset} connectedAccounts={connectedAccounts} />
        </>
      )}
    </div>
  );
}
