// src/app/layout.tsx additions and fixes
// FIX #12: Dev tools (Next.js toolbar, Grammarly, notifications) only show in development
// Add this to your root layout.tsx

// 1. Add suppressHydrationWarning to <html> tag to prevent Grammarly injection warnings:
// <html lang="en" suppressHydrationWarning>

// 2. Add this script to <head> to hide Next.js dev toolbar in any leaked builds:
// Only relevant if NODE_ENV check doesn't work
const hideDevToolsScript = `
  if (typeof window !== 'undefined') {
    // Remove Next.js dev toolbar if it leaked into production
    const observer = new MutationObserver(() => {
      const toolbar = document.querySelector('nextjs-portal');
      if (toolbar) { toolbar.remove(); }
      const devButton = document.querySelector('[data-nextjs-dialog-overlay]');
      if (devButton) { devButton.remove(); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
`;

// Add this to your layout <head>:
export const DevToolsKiller = () => (
  <>
    {process.env.NODE_ENV === "production" && (
      <script
        dangerouslySetInnerHTML={{ __html: hideDevToolsScript.trim() }}
      />
    )}
  </>
);

// ── Also verify in next.config.ts: ─────────────────────────────────────────
// The Next.js devtools only show when NODE_ENV=development.
// Vercel automatically sets NODE_ENV=production on deploy.
// If you see them in production it means:
// a) Your Vercel env has NODE_ENV=development set manually (remove it)
// b) Or the app is running in preview mode — check Vercel env var scope

// ────────────────────────────────────────────────────────────────────────────────
// FIX #7: Content Agent page improvements
// src/app/dashboard/content-agent/page.tsx additions

export const CONTENT_AGENT_EXAMPLES = [
  {
    topic:    "How I grew my LinkedIn from 0 to 5K followers in 6 months",
    tone:     "Professional",
    audience: "Content creators and marketers",
    preview:  "A LinkedIn post + Twitter thread + email newsletter all generated from one topic",
  },
  {
    topic:    "5 mistakes I made as a first-time founder",
    tone:     "Vulnerable / honest",
    audience: "Early-stage founders and entrepreneurs",
    preview:  "A personal story repurposed across 7 platforms automatically",
  },
  {
    topic:    "Why most social media advice is wrong",
    tone:     "Contrarian / educational",
    audience: "Business owners spending time on social media",
    preview:  "A bold opinion piece turned into a content week's worth of posts",
  },
];

// Add this component to your Content Agent page to show example use cases:
export function ContentAgentGuide() {
  return (
    <div style={{ marginBottom: "28px" }}>
      {/* What it does */}
      <div style={{
        background:   "#EFF6FF",
        border:       "1px solid #BFDBFE",
        borderRadius: "12px",
        padding:      "16px 20px",
        marginBottom: "20px",
      }}>
        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1E3A5F", marginBottom: "6px" }}>
          What is the Content Agent?
        </p>
        <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6 }}>
          Give it a topic, tone, and audience — it writes a full blog-quality draft for you,
          then automatically repurposes it into posts for LinkedIn, Twitter, Instagram,
          Facebook, Email, and Reddit. Your entire content week, from one idea.
        </p>
      </div>

      {/* Example topics */}
      <p style={{ fontSize: "12px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px" }}>
        Example topics to try
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {CONTENT_AGENT_EXAMPLES.map((ex) => (
          <div
            key={ex.topic}
            style={{
              background:   "#FFFFFF",
              border:       "0.5px solid #E5E7EB",
              borderRadius: "10px",
              padding:      "12px 14px",
              cursor:       "pointer",
              transition:   "border-color .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#BFDBFE"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <p style={{ fontSize: "13px", fontWeight: 500, color: "#111827", marginBottom: "4px" }}>
              "{ex.topic}"
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#2563EB", background: "#EFF6FF", padding: "1px 7px", borderRadius: "4px" }}>
                {ex.tone}
              </span>
              <span style={{ fontSize: "11px", color: "#6B7280" }}>
                → {ex.preview}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
