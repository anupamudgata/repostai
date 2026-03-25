import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RepostAI — One post. Every platform. Under 60 seconds.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Gradient orbs */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)",
            top: -100,
            right: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)",
            bottom: -80,
            left: -80,
          }}
        />

        {/* Logo and brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            RepostAI
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            One post. Every platform.
          </span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              background: "linear-gradient(90deg, #818cf8, #c084fc, #f472b6)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-1px",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Under 60 seconds.
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            marginTop: 24,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          AI-powered content repurposing for LinkedIn, Twitter/X, Instagram, and 6 more platforms
        </p>

        {/* Platform badges */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 36,
          }}
        >
          {["LinkedIn", "X", "Instagram", "Email", "Reddit", "TikTok", "WhatsApp"].map(
            (p) => (
              <div
                key={p}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {p}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
