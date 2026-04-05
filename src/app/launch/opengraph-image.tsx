import { ImageResponse } from "next/og";

export const alt = "RepostAI — AI Content Repurposing for Indian Languages";
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
          background:
            "linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)",
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

        {/* Green glow orbs */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
            top: -120,
            right: -80,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
            bottom: -100,
            left: -60,
          }}
        />

        {/* Product Hunt badge */}
        <div
          style={{
            position: "absolute",
            top: 36,
            right: 48,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(251, 191, 36, 0.15)",
            border: "1px solid rgba(251, 191, 36, 0.4)",
            borderRadius: 999,
            padding: "8px 18px",
            color: "#fbbf24",
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          🐱 Featured on Product Hunt
        </div>

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "linear-gradient(135deg, #10b981, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontSize: 46,
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
            gap: 10,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          <span
            style={{
              fontSize: 50,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            AI Content Repurposing
          </span>
          <span
            style={{
              fontSize: 50,
              fontWeight: 800,
              background: "linear-gradient(90deg, #34d399, #6366f1, #a78bfa)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-1px",
              lineHeight: 1.1,
              textAlign: "center",
            }}
          >
            for Indian Languages
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            marginTop: 24,
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.4,
          }}
        >
          Hindi · Bengali · Tamil · Telugu · Kannada · Odia · Punjabi · Marathi
        </p>

        {/* Platform badges */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 36,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 800,
          }}
        >
          {[
            "LinkedIn",
            "Twitter/X",
            "Instagram",
            "WhatsApp",
            "Telegram",
            "+ more",
          ].map((p) => (
            <div
              key={p}
              style={{
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
