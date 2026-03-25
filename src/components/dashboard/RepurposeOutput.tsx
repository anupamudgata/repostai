"use client";

import { useState, useEffect, useRef } from "react";
import type { PlatformState, StreamStatus } from "@/hooks/useRepurposeStream";
import type { Platform }                    from "@/lib/ai/types";

interface PlatformMeta { label: string; color: string; icon: string }

const PLATFORM_META: Record<Platform, PlatformMeta> = {
  linkedin:       { label: "LinkedIn",        color: "#0A66C2", icon: "in" },
  twitter_thread: { label: "X Thread",        color: "#1D9BF0", icon: "𝕏"  },
  twitter_single: { label: "X Post",          color: "#1D9BF0", icon: "𝕏"  },
  instagram:      { label: "Instagram",       color: "#E1306C", icon: "IG" },
  facebook:       { label: "Facebook",        color: "#1877F2", icon: "f"  },
  reddit:         { label: "Reddit",          color: "#FF4500", icon: "r/" },
  email:          { label: "Email",           color: "#059669", icon: "@"  },
  tiktok:         { label: "TikTok",          color: "#FE2C55", icon: "TT" },
  whatsapp_status:{ label: "WhatsApp Status", color: "#25D366", icon: "WA" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  return (
    <button onClick={handleCopy} className="ro-copy-btn" data-copied={copied || undefined}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function Cursor() {
  return <span className="ro-cursor" />;
}

function SkeletonLine({ width = "100%", delay = 0 }: { width?: string; delay?: number }) {
  return <div className="ro-skeleton" style={{ width, animationDelay: `${delay}ms` }} />;
}

function PlatformCard({ state, index }: { state: PlatformState; index: number }) {
  const meta        = PLATFORM_META[state.platform] ?? { label: state.platform, color: "#6B7280", icon: "?" };
  const isStreaming = state.status === "streaming";
  const isDone      = state.status === "done";
  const isError     = state.status === "error";
  const isWaiting   = state.status === "waiting" || state.status === "idle";
  const contentRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isStreaming && contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight; }, [state.content, isStreaming]);

  const displayContent = state.platform === "twitter_thread" && state.tweets?.length ? state.tweets.join("\n\n――――\n\n") : state.content;
  const copyText = state.platform === "email" && state.subject ? `Subject: ${state.subject}\n\n${state.content}`
    : state.platform === "reddit"    && state.title    ? `${state.title}\n\n${state.content}`
    : state.platform === "instagram" && state.hashtags?.length ? `${state.content}\n\n${state.hashtags.map(h => `#${h}`).join(" ")}`
    : displayContent;

  const accentBg     = `${meta.color}12`;
  const accentBorder = `${meta.color}30`;

  return (
    <div
      style={{
        background: "var(--ro-card)",
        borderRadius: "16px",
        border: isDone ? `1.5px solid ${accentBorder}` : isError ? "1.5px solid #FECACA" : isStreaming ? `1.5px solid ${meta.color}40` : "1px solid var(--ro-border)",
        overflow: "hidden",
        transition: "border-color .3s ease, box-shadow .3s ease",
        boxShadow: isStreaming ? `0 0 0 3px ${meta.color}10` : isDone ? "0 2px 12px rgba(0,0,0,.04)" : "none",
        animation: `cardIn .4s ease ${index * 60}ms both`,
        position: "relative",
      }}
    >
      {isStreaming && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg,${meta.color},${meta.color}80)`, animation: "progressSlide 2s ease infinite" }} />}
      {isDone      && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: meta.color, borderRadius: "16px 16px 0 0" }} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px 10px", background: isDone ? accentBg : "var(--ro-card-header)", borderBottom: "0.5px solid var(--ro-border)", transition: "background .4s ease" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: isDone ? meta.color : "var(--ro-icon-idle)", color: isDone ? "#FFFFFF" : "var(--ro-icon-idle-fg)", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .4s ease", flexShrink: 0, fontFamily: "monospace" }}>{meta.icon}</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--ro-text-primary)", lineHeight: 1.2 }}>{meta.label}</div>
            <div style={{ fontSize: "11px", marginTop: "1px" }}>
              {isWaiting   && <span style={{ color: "var(--ro-text-secondary)" }}>Waiting...</span>}
              {isStreaming && <span style={{ color: meta.color, fontWeight: 500 }}>Writing...</span>}
              {isDone      && <span style={{ color: "#10B981" }}>✓ Done{state.durationMs ? <span style={{ color: "var(--ro-text-secondary)", fontWeight: 400 }}> · {(state.durationMs / 1000).toFixed(1)}s</span> : null}</span>}
              {isError     && <span style={{ color: "#EF4444" }}>Failed</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {isDone && state.platform === "email"  && state.subject && <span style={{ fontSize: "11px", color: meta.color, background: accentBg, border: `0.5px solid ${accentBorder}`, padding: "2px 8px", borderRadius: "4px", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{state.subject}</span>}
          {isDone && state.platform === "reddit" && state.title   && <span style={{ fontSize: "11px", color: meta.color, background: accentBg, border: `0.5px solid ${accentBorder}`, padding: "2px 8px", borderRadius: "4px", maxWidth: "160px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{state.title}</span>}
          {isDone && copyText && <CopyButton text={copyText} />}
        </div>
      </div>

      <div ref={contentRef} style={{ padding: "14px 16px", maxHeight: isDone ? "280px" : "200px", overflowY: "auto", transition: "max-height .5s ease" }}>
        {isWaiting && <div style={{ opacity: 0.5 }}><SkeletonLine width="90%" delay={0} /><SkeletonLine width="70%" delay={100} /><SkeletonLine width="85%" delay={200} /><SkeletonLine width="40%" delay={300} /></div>}

        {(isStreaming || isDone) && (
          <div style={{ fontSize: "13px", lineHeight: 1.75, color: "var(--ro-text-body)", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "'Georgia','Times New Roman',serif" }}>
            {state.platform === "twitter_thread" && state.tweets?.length ? (
              <div>
                {state.tweets.map((tweet, i) => (
                  <div key={i} style={{ background: "var(--ro-tweet-bg)", border: "0.5px solid var(--ro-border)", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", fontSize: "13px", lineHeight: 1.65, color: "var(--ro-text-body)" }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--ro-text-secondary)", marginBottom: "4px", fontFamily: "monospace" }}>TWEET {i + 1} · {tweet.length}/280</div>
                    {tweet}
                  </div>
                ))}
                {isStreaming && <Cursor />}
              </div>
            ) : (
              <>{displayContent}{isStreaming && <Cursor />}</>
            )}
          </div>
        )}

        {isDone && state.platform === "instagram" && state.hashtags?.length && (
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "0.5px solid var(--ro-border)", display: "flex", flexWrap: "wrap", gap: "5px" }}>
            {state.hashtags.map(tag => <span key={tag} style={{ fontSize: "11px", color: meta.color, background: accentBg, padding: "2px 8px", borderRadius: "4px", fontWeight: 500 }}>#{tag}</span>)}
          </div>
        )}

        {isError && <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#EF4444" }}><span>⚠</span>{state.error ?? "Generation failed."}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ progress, status }: { progress: number; status: StreamStatus }) {
  const colors: Record<StreamStatus, string> = { idle: "var(--ro-icon-idle)", extracting: "#F59E0B", streaming: "#2563EB", done: "#10B981", error: "#EF4444" };
  const labels: Record<StreamStatus, string> = { idle: "", extracting: "Analysing your content...", streaming: "Generating platform posts...", done: "All done", error: "Something went wrong" };
  if (status === "idle") return null;
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "13px", fontWeight: 500, color: status === "error" ? "#EF4444" : "var(--ro-text-label)", display: "flex", alignItems: "center", gap: "7px" }}>
          {status === "extracting" && <span style={{ display: "inline-block", width: "12px", height: "12px", borderRadius: "50%", border: "2px solid #FEF3C7", borderTop: "2px solid #F59E0B", animation: "spin .7s linear infinite", flexShrink: 0 }} />}
          {status === "streaming"  && <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#2563EB", animation: "pulse 1s ease infinite", flexShrink: 0 }} />}
          {status === "done"       && <span style={{ color: "#10B981" }}>✓</span>}
          {labels[status]}
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: colors[status], fontFamily: "monospace" }}>{progress}%</span>
      </div>
      <div style={{ height: "4px", borderRadius: "999px", background: "var(--ro-track)", overflow: "hidden" }}>
        <div style={{ height: "4px", borderRadius: "999px", background: colors[status], width: `${progress}%`, transition: "width .4s ease, background .4s ease" }} />
      </div>
    </div>
  );
}

export interface RepurposeOutputProps {
  status:    StreamStatus;
  platforms: Partial<Record<Platform, PlatformState>>;
  totalMs:   number;
  remaining: number | null;
  error:     string;
  progress:  number;
  onReset?:  () => void;
}

export function RepurposeOutput({ status, platforms, totalMs, remaining, error, progress, onReset }: RepurposeOutputProps) {
  const platformEntries = Object.values(platforms) as PlatformState[];
  const doneCount = platformEntries.filter((p) => p.status === "done").length;

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes cardIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer{ 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes progressSlide{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        .ro-cursor { display:inline-block;width:2px;height:1em;background:currentColor;margin-left:2px;vertical-align:text-bottom;animation:blink .7s step-end infinite }
        .ro-skeleton { height:12px;border-radius:6px;background:linear-gradient(90deg,var(--ro-skeleton-a) 25%,var(--ro-skeleton-b) 50%,var(--ro-skeleton-a) 75%);background-size:200% 100%;animation:shimmer 1.4s ease infinite;margin-bottom:8px }
        .ro-copy-btn { display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:6px;border:0.5px solid var(--ro-border-mid);background:transparent;color:var(--ro-text-muted);font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;flex-shrink:0 }
        .ro-copy-btn[data-copied] { border-color:#86EFAC;background:#F0FDF410;color:#16A34A }
      `}</style>

      <ProgressBar progress={progress} status={status} />

      {status === "done" && (
        <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", background: "#10B98118", border: "1px solid #10B98130", borderRadius: "10px", marginBottom: "20px", flexWrap: "wrap", animation: "cardIn .4s ease both" }}>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#16A34A", color: "#fff", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
            {doneCount} posts generated
          </span>
          <span style={{ fontSize: "12px", color: "var(--ro-text-secondary)" }}>Completed in {(totalMs / 1000).toFixed(1)}s</span>
          {remaining !== null && <span style={{ fontSize: "12px", color: "var(--ro-text-secondary)", marginLeft: "auto" }}>{remaining} repurposes remaining</span>}
        </div>
      )}

      {status === "error" && (
        <div style={{ padding: "16px", background: "#EF444418", border: "1px solid #EF444430", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <p style={{ fontSize: "13px", color: "#EF4444", fontWeight: 500 }}>{error}</p>
          {onReset && <button onClick={onReset} style={{ padding: "7px 14px", borderRadius: "7px", border: "1px solid #EF444430", background: "transparent", color: "#EF4444", fontSize: "12px", fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>Try again</button>}
        </div>
      )}

      {platformEntries.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "14px" }}>
          {platformEntries.map((s, i) => <PlatformCard key={s.platform} state={s} index={i} />)}
        </div>
      )}
    </div>
  );
}
