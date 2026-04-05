import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RepostAI — AI Content Repurposing for Indian Languages | Product Hunt",
  description:
    "The only AI content tool built for Indian creators. Turn one blog post into LinkedIn, Twitter, WhatsApp, Telegram & Instagram posts in Hindi, Bengali, Tamil & 6 more languages.",
  openGraph: {
    title: "RepostAI — AI Content Repurposing for Indian Languages",
    description:
      "Repurpose content in Hindi, Bengali, Tamil & 6 more Indian languages. Powered by AI.",
    url: "https://repostai-zeta.vercel.app/launch",
  },
};

const FEATURES = [
  {
    emoji: "🇮🇳",
    title: "9 Indian Languages",
    description:
      "Hindi, Bengali, Marathi, Telugu, Tamil, Kannada, Odia, Punjabi & more. Write for your audience, in their language.",
  },
  {
    emoji: "⚡",
    title: "8 Platforms at Once",
    description:
      "LinkedIn, Twitter/X, Instagram, WhatsApp, Telegram & more — all from one paste.",
  },
  {
    emoji: "🎙️",
    title: "Brand Voice AI",
    description:
      "Learns your unique writing style so every post sounds like you, not a robot.",
  },
  {
    emoji: "📅",
    title: "Schedule & Post",
    description:
      "Plan your content calendar and publish directly from the dashboard. No copy-paste marathons.",
  },
];

const PROOF_POINTS = [
  "Free to start — no credit card ever",
  "Works in 9 Indian languages",
  "Generates posts in under 60 seconds",
  "Used by creators across India",
];

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── Product Hunt Banner ── */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-center">
        <p className="text-sm font-semibold text-amber-800">
          🎉 We&apos;re live on Product Hunt today!{" "}
          <a
            href="https://www.producthunt.com/posts/repostai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:no-underline font-bold text-amber-900"
          >
            Upvote us and say hi →
          </a>
        </p>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white pt-16 pb-20 px-4 text-center">
        {/* Subtle background orbs */}
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.24 280 / 0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-40 h-[400px] w-[400px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.24 280 / 0.3) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* India-first pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            🇮🇳 Built for India&apos;s 800M+ internet users
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.1] text-gray-900 mb-5">
            Repurpose Content in Hindi, Bengali, Tamil &amp; 6 More Indian
            Languages —{" "}
            <span className="text-primary">Powered by AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            The only AI content tool built for Indian creators. Turn one blog
            post into LinkedIn, Twitter, WhatsApp, Telegram &amp; Instagram
            posts — in your language.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg hover:bg-primary/90 transition-all w-full sm:w-auto"
            >
              Try Free — No Credit Card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/30 px-8 py-4 text-base font-semibold text-primary hover:border-primary/60 hover:bg-primary/5 transition-all w-full sm:w-auto"
            >
              See a live demo
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            Free plan: 5 repurposes/month, forever. No credit card.
          </p>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Everything an Indian creator needs
          </h2>
          <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
            Stop writing the same content 8 times. One paste, all platforms, your language.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
              >
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof ── */}
      <section className="py-14 px-4 bg-slate-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Why RepostAI exists
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            Built for India&apos;s 800M+ internet users
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
            {PROOF_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Language Showcase ── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Your language. Your audience.
          </h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto">
            Most AI tools force you to write in English. We don&apos;t. Post in the language your audience actually speaks.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              "हिंदी",
              "বাংলা",
              "தமிழ்",
              "తెలుగు",
              "ಕನ್ನಡ",
              "ਪੰਜਾਬੀ",
              "ଓଡ଼ିଆ",
              "मराठी",
              "English",
            ].map((lang) => (
              <span
                key={lang}
                className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder Note ── */}
      <section className="py-14 px-4 bg-gradient-to-br from-primary/5 to-primary/10 border-y border-primary/10">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white border border-primary/15 p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                👋
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                  A note from the founder
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Hi Product Hunt! I&apos;m building RepostAI for Indian content
                  creators who&apos;ve always had to write in English to use AI
                  tools. That changes today.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  800 million Indians are online. Most of them are not writing
                  in English. Yet every content tool assumes you are. RepostAI
                  is different — it starts with your language, your platform,
                  your audience.
                </p>
                <p className="text-gray-600 text-sm font-semibold">
                  — Anupam, Founder at RepostAI
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Second CTA ── */}
      <section className="py-16 px-4 bg-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Ready to repurpose in your language?
          </h2>
          <p className="text-gray-500 mb-8">
            Free to start. No credit card. Cancel anytime.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-10 py-4 text-base font-bold text-white shadow-lg hover:bg-primary/90 transition-all"
          >
            Start Repurposing Free →
          </Link>
          <p className="mt-5 text-xs text-gray-400">
            Questions?{" "}
            <a
              href="mailto:support@repostai.com"
              className="underline hover:no-underline text-gray-500"
            >
              Email us anytime.
            </a>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center bg-slate-50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-400">
          <Link
            href="/"
            className="font-semibold text-gray-600 hover:text-primary transition-colors"
          >
            ← Back to RepostAI
          </Link>
          <span className="hidden sm:inline text-gray-200">·</span>
          <a
            href="https://www.producthunt.com/posts/repostai"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-600 transition-colors"
          >
            🐱 View on Product Hunt
          </a>
          <span className="hidden sm:inline text-gray-200">·</span>
          <Link href="/pricing" className="hover:text-gray-600 transition-colors">
            Pricing
          </Link>
        </div>
        <p className="mt-4 text-xs text-gray-300">
          © {new Date().getFullYear()} RepostAI. Made with love in India.
        </p>
      </footer>
    </div>
  );
}
