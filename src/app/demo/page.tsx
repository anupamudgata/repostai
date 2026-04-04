"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Copy,
  Check,
  Loader2,
  Sparkles,
  ImageIcon,
  Type,
  ChevronRight,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Send,
  RefreshCw,
} from "lucide-react";
import { LandingNav } from "@/components/landing-nav";

// ─── Types ────────────────────────────────────────────────────────────────────

type PlatformId = "linkedin" | "twitter_single" | "instagram" | "facebook" | "telegram";

type DemoTab = "text" | "photo";

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_TEXT = `I've been thinking about why most content creators burn out within 6 months.

They treat content creation like a sprint — posting every day, chasing every trend, optimising every metric.

But the creators who last 5+ years? They treat it like a marathon.

Here's the difference:
- They batch-create content 2-3 days a week, not every day
- They focus on 2-3 platforms they genuinely enjoy, not 10 they feel obligated to
- They repurpose one piece of long-form content into 8-10 short-form pieces
- They measure growth month-over-month, not post-by-post

The secret to sustainable content creation is not more discipline. It's better systems.

What system changed the game for you?`;

const PLATFORMS: { id: PlatformId; name: string; short: string; color: string; bg: string; border: string; Icon: React.ElementType }[] = [
  { id: "linkedin",      name: "LinkedIn",     short: "in",  color: "#0A66C2", bg: "#EBF5FF", border: "#BFDBFE", Icon: Linkedin },
  { id: "twitter_single",name: "X (Twitter)",  short: "𝕏",  color: "#0F172A", bg: "#F1F5F9", border: "#CBD5E1", Icon: Twitter },
  { id: "instagram",     name: "Instagram",    short: "IG",  color: "#C13584", bg: "#FDF2F8", border: "#FBCFE8", Icon: Instagram },
  { id: "facebook",      name: "Facebook",     short: "f",   color: "#1877F2", bg: "#EFF6FF", border: "#BFDBFE", Icon: Facebook },
  { id: "telegram",      name: "Telegram",     short: "TG",  color: "#0088CC", bg: "#E8F4FD", border: "#BAE0F9", Icon: Send },
];

// Pre-baked photo demo — avoids requiring upload in public demo
const PHOTO_DEMO_CAPTIONS: Record<PlatformId, string> = {
  linkedin: `Behind every great product launch is a team that refused to sleep on mediocrity. 🚀

This moment captures exactly that — the energy, the focus, the belief that what we're building actually matters.

If you're building something meaningful right now, I'd love to hear about it in the comments. Let's celebrate the builders.

#ProductLaunch #Entrepreneurship #Startup #BuildInPublic #Innovation

— repostai.com`,
  twitter_single: `This photo says everything about what we're building. 🔥

The energy in the room when the team knows they're onto something real.

What are you working on right now? Drop it below 👇 repostai.com`,
  instagram: `The magic happens when passion meets execution ✨

Some behind-the-scenes from what we've been building. Every pixel, every line, every late-night decision — it all adds up.

Swipe to see the journey 👉

#BehindTheScenes #BuildInPublic #Startup #CreatorEconomy #Innovation #Entrepreneurship #ProductDesign #TechStartup #IndieHacker #BuildingInPublic

— repostai.com`,
  facebook: `Wanted to share a little behind-the-scenes moment from our journey. 📸

There's something special about capturing the exact moment a team realizes they're building something real. No filters, no staging — just pure focused energy.

We'd love to know: what does YOUR workspace look like when you're in full flow? Share a photo below! 👇

— repostai.com`,
  telegram: `📸 Behind the scenes

Some moments are worth freezing in time. This is one of them — pure focus, real energy, something being built that actually matters.

We're sharing more of this journey openly. Follow along if you want the unfiltered version.

#BuildInPublic #Startup #BehindTheScenes

— repostai.com`,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<DemoTab>("text");

  // Text demo state
  const [inputText, setInputText]         = useState(SAMPLE_TEXT);
  const [selectedPlatforms, setSelected]  = useState<Set<PlatformId>>(new Set(["linkedin", "twitter_single", "instagram"]));
  const [generating, setGenerating]       = useState(false);
  const [outputs, setOutputs]             = useState<Record<string, string> | null>(null);
  const [error, setError]                 = useState("");
  const [copiedKey, setCopiedKey]         = useState("");

  // Photo demo state
  const [photoGenerated, setPhotoGenerated] = useState(false);
  const [photoGenerating, setPhotoGenerating] = useState(false);
  const [photoPlatforms, setPhotoPlatforms] = useState<Set<PlatformId>>(new Set(["instagram", "linkedin", "twitter_single"]));

  const outputRef = useRef<HTMLDivElement>(null);

  function togglePlatform(id: PlatformId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        if (next.size < 4) next.add(id);
      }
      return next;
    });
  }

  function togglePhotoPlatform(id: PlatformId) {
    setPhotoPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        if (next.size < 4) next.add(id);
      }
      return next;
    });
  }

  async function handleGenerate() {
    if (!inputText.trim() || generating) return;
    setGenerating(true);
    setError("");
    setOutputs(null);

    try {
      const res = await fetch("/api/demo/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, platforms: Array.from(selectedPlatforms) }),
      });
      const data = await res.json() as { outputs?: Record<string, string>; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setOutputs(data.outputs ?? {});
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handlePhotoGenerate() {
    if (photoGenerating) return;
    setPhotoGenerating(true);
    await new Promise((r) => setTimeout(r, 1800)); // simulate generation
    setPhotoGenerating(false);
    setPhotoGenerated(true);
  }

  function copyToClipboard(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    });
  }

  const platformMeta = (id: string) => PLATFORMS.find((p) => p.id === id);

  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-10 px-4 text-center bg-gradient-to-b from-slate-50 to-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          Live interactive demo — no signup needed
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 max-w-2xl mx-auto leading-tight">
          See RepostAI in action
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          Paste any text or use our sample. Watch it turn into platform-ready content for LinkedIn, Twitter, Instagram and more — in seconds.
        </p>
      </section>

      {/* ── Tab switcher ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 flex gap-1 py-3">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "text"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <Type className="h-4 w-4" />
            Text → Posts
          </button>
          <button
            onClick={() => setActiveTab("photo")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "photo"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Photo → Captions
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── TEXT DEMO ─────────────────────────────────────────────────── */}
        {activeTab === "text" && (
          <>
            {/* Step 1: Input */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="font-semibold text-sm text-gray-700">Your content</span>
                <span className="ml-auto text-xs text-gray-400">{inputText.length}/3000 chars</span>
              </div>
              <div className="p-4">
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value.slice(0, 3000)); setOutputs(null); }}
                  rows={10}
                  className="w-full resize-none text-sm text-gray-800 leading-relaxed focus:outline-none placeholder:text-gray-400"
                  placeholder="Paste your blog post, newsletter, idea, or any content here…"
                />
              </div>
              <div className="border-t border-gray-100 px-4 py-2.5 flex gap-2">
                <button
                  onClick={() => { setInputText(SAMPLE_TEXT); setOutputs(null); }}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Use sample text
                </button>
                <span className="text-gray-300 text-xs">·</span>
                <button
                  onClick={() => { setInputText(""); setOutputs(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Step 2: Platform select */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="font-semibold text-sm text-gray-700">Choose platforms</span>
                <span className="ml-auto text-xs text-gray-400">up to 4</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? "border-transparent text-white shadow-sm"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                      style={active ? { background: p.color, borderColor: p.color } : {}}
                    >
                      <p.Icon className="h-4 w-4 shrink-0" />
                      {p.name}
                      {active && <Check className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Generate */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating || inputText.trim().length < 20 || selectedPlatforms.size === 0}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-base shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate posts
                  </>
                )}
              </button>
              {outputs && !generating && (
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                </button>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Outputs */}
            {outputs && (
              <div ref={outputRef} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your posts — ready to publish</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                {Object.entries(outputs).map(([platformId, content]) => {
                  const meta = platformMeta(platformId);
                  if (!meta) return null;
                  const key = `text-${platformId}`;
                  return (
                    <div
                      key={platformId}
                      className="rounded-2xl border overflow-hidden shadow-sm"
                      style={{ borderColor: meta.border }}
                    >
                      {/* Card header */}
                      <div
                        className="px-4 py-3 flex items-center gap-3"
                        style={{ background: meta.bg }}
                      >
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{ background: meta.color }}
                        >
                          <meta.Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: meta.color }}>
                          {meta.name}
                        </span>
                        <button
                          onClick={() => copyToClipboard(key, content)}
                          className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{
                            background: copiedKey === key ? "#DCFCE7" : "white",
                            color: copiedKey === key ? "#166534" : meta.color,
                            border: `1px solid ${meta.border}`,
                          }}
                        >
                          {copiedKey === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedKey === key ? "Copied!" : "Copy"}
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-4 bg-white">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {content}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* CTA after outputs */}
                <CtaBanner />
              </div>
            )}
          </>
        )}

        {/* ── PHOTO DEMO ────────────────────────────────────────────────── */}
        {activeTab === "photo" && (
          <>
            {/* Sample photo */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="font-semibold text-sm text-gray-700">Sample photo</span>
                <span className="ml-auto text-xs text-gray-400">In the real app, upload your own</span>
              </div>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="Team working together"
                  className="w-full object-cover"
                  style={{ maxHeight: "320px", objectPosition: "center top" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <span className="text-xs text-white/90 bg-black/40 rounded-lg px-3 py-1 backdrop-blur-sm">
                    Photo by Marvin Meyer · Unsplash
                  </span>
                </div>
              </div>
            </div>

            {/* Platform select for photo */}
            <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="font-semibold text-sm text-gray-700">Choose platforms</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PLATFORMS.map((p) => {
                  const active = photoPlatforms.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePhotoPlatform(p.id)}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${
                        active ? "border-transparent text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                      style={active ? { background: p.color, borderColor: p.color } : {}}
                    >
                      <p.Icon className="h-4 w-4 shrink-0" />
                      {p.name}
                      {active && <Check className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate button */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => { setPhotoGenerated(false); handlePhotoGenerate(); }}
                disabled={photoGenerating}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-primary text-white font-bold text-base shadow-lg hover:bg-primary/90 transition-all disabled:opacity-50 w-full sm:w-auto justify-center"
              >
                {photoGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing photo…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate captions
                  </>
                )}
              </button>
            </div>

            {/* Photo outputs */}
            {photoGenerated && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Captions — ready to publish</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                {Array.from(photoPlatforms).map((platformId) => {
                  const meta = platformMeta(platformId);
                  const content = PHOTO_DEMO_CAPTIONS[platformId];
                  if (!meta || !content) return null;
                  const key = `photo-${platformId}`;
                  return (
                    <div key={platformId} className="rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: meta.border }}>
                      <div className="px-4 py-3 flex items-center gap-3" style={{ background: meta.bg }}>
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: meta.color }}>
                          <meta.Icon className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm" style={{ color: meta.color }}>{meta.name}</span>
                        <button
                          onClick={() => copyToClipboard(key, content)}
                          className="ml-auto flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: copiedKey === key ? "#DCFCE7" : "white", color: copiedKey === key ? "#166534" : meta.color, border: `1px solid ${meta.border}` }}
                        >
                          {copiedKey === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedKey === key ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="p-4 bg-white">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
                      </div>
                    </div>
                  );
                })}

                <CtaBanner />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer CTA ────────────────────────────────────────────────── */}
      {!outputs && !photoGenerated && (
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Want unlimited repurposing?</h3>
            <p className="text-gray-500 text-sm mb-5">Sign up free — no credit card needed. Get 5 repurposes/month on the free plan.</p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Start for free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CtaBanner() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 text-white text-center shadow-lg">
      <div className="text-2xl mb-2">🚀</div>
      <h3 className="text-lg font-bold mb-1">Like what you see?</h3>
      <p className="text-white/80 text-sm mb-4">
        Sign up free and repurpose your content to 10 platforms — LinkedIn, Instagram, Twitter, Telegram and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white text-primary font-bold text-sm hover:bg-white/90 transition-colors shadow-sm"
        >
          Start for free <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white/15 text-white font-semibold text-sm hover:bg-white/25 transition-colors border border-white/20"
        >
          View plans <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
