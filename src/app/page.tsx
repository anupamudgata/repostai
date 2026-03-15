"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Globe,
  Sparkles,
  Check,
  Clock,
  MousePointerClick,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Mail,
  MessageCircle,
  Play as PlayIcon,
  ChevronDown,
  Play,
  Copy,
  FileText,
  Youtube,
  Link as LinkIcon,
  Type,
  Shield,
  Users,
  TrendingUp,
  Heart,
  Wand2,
  Plug,
  Send,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLANS, SUPPORT_EMAIL, LANDING_USER_COUNT, LANDING_VIDEO_URL, LANDING_TESTIMONIALS } from "@/config/constants";
import { LandingNav } from "@/components/landing-nav";

const PRICING_REGIONS = [
  { id: "global", label: "Global (USD $)", symbol: "$" },
  { id: "eu", label: "Europe (EUR €)", symbol: "€" },
  { id: "in", label: "India (INR ₹)", symbol: "₹" },
  { id: "latam", label: "Latin America (USD $)", symbol: "$" },
] as const;

const PLATFORMS = [
  { name: "LinkedIn", icon: Linkedin, color: "bg-blue-600" },
  { name: "Twitter/X Thread", icon: Twitter, color: "bg-sky-500" },
  { name: "Twitter/X Post", icon: Twitter, color: "bg-sky-500" },
  { name: "Instagram", icon: Instagram, color: "bg-pink-500" },
  { name: "Facebook", icon: Facebook, color: "bg-blue-500" },
  { name: "Email", icon: Mail, color: "bg-emerald-500" },
  { name: "Reddit", icon: MessageCircle, color: "bg-orange-500" },
  { name: "TikTok", icon: PlayIcon, color: "bg-black" },
  { name: "WhatsApp Status", icon: MessageCircle, color: "bg-green-500" },
];

const USE_CASES = [
  {
    title: "Content Creators",
    description:
      "Write one blog post and get LinkedIn, Twitter, Instagram, and email versions instantly. Save hours every week.",
  },
  {
    title: "Marketing Teams",
    description:
      "Keep brand voice consistent across every channel with AI that learns your style. No more copy-paste formatting.",
  },
  {
    title: "Freelancers & Agencies",
    description:
      "Manage multiple clients with separate brand voices. Repurpose each piece of content to all platforms in seconds.",
  },
];

const FAQ_ITEMS = [
  {
    q: "Is the generated content really platform-specific?",
    a: "Yes. LinkedIn posts get professional hooks and hashtags. Twitter threads are numbered and under 280 chars. Instagram captions include relevant hashtags. Each platform's output follows that platform's native conventions — it's not just the same text copy-pasted everywhere.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT gives you one output at a time with no structure. RepostAI generates all 7+ platforms simultaneously with platform-specific formatting, brand voice matching, and one-click copy. It's built specifically for content repurposing, not general chat.",
  },
  {
    q: "What does 'brand voice training' mean?",
    a: "Paste 3-5 examples of your previous writing (LinkedIn posts, tweets, etc.) and the AI learns your tone, vocabulary, and style. Every output will sound like YOU wrote it, not a robot.",
  },
  {
    q: "Can I use it for my clients' content?",
    a: "Absolutely. The Agency plan ($49/mo) supports up to 10 different brand voices — one per client. Switch between voices instantly.",
  },
  {
    q: "What if I don't like the output?",
    a: "Click 'Regenerate' on any individual platform to get a fresh version. You can also edit the output directly before copying.",
  },
  {
    q: "Is there a free trial?",
    a: "Better — there's a free plan. 5 repurposes per month, forever, no credit card required. Upgrade to Pro only when you need unlimited.",
  },
  {
    q: "What if it's not for me?",
    a: "We offer a 14-day money-back guarantee on all paid plans. If you're not saving time, email us and we'll refund you — no questions asked.",
  },
  {
    q: "What is AI Content Starter?",
    a: "AI Content Starter lets you generate a full blog-quality draft from just a topic, tone, audience, and length — no writing required. Once the AI writes your post, you can review, edit, and then auto-repurpose it to every platform in one click. It's the complete content flywheel: idea to everywhere. Available on Pro and Agency plans.",
  },
  {
    q: "Do you support multiple languages?",
    a: "Yes! RepostAI supports 5 languages: English, Hindi (हिन्दी), Spanish (Español), Portuguese (Português), and French (Français). Select your output language before generating — the AI writes naturally in each language, not just translates.",
  },
];

export default function LandingPage() {
  const [pricingRegion, setPricingRegion] = useState<string>("global");
  const pricingSymbol =
    PRICING_REGIONS.find((r) => r.id === pricingRegion)?.symbol ?? "$";

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav />

      {/* Hero — responsive padding & typography */}
      <section className="relative py-12 sm:py-20 lg:py-28 hero-gradient">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge
                variant="secondary"
                className="mb-4 sm:mb-6 animate-fade-up border border-primary/20 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm"
              >
                <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 text-primary" />
                Save 5+ hours every week
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-up animation-delay-200">
                One post.{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Every platform.
                </span>
                <br />
                Under 60 seconds.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-up animation-delay-400 px-1 sm:px-0">
                Stop rewriting the same idea 7 different ways. Paste a blog post,
                YouTube link, or any text — get perfectly formatted, platform-native
                content for LinkedIn, Twitter/X, Instagram, Email & more in one click.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up animation-delay-600">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto min-h-[48px] text-base px-6 sm:px-8 shadow-lg shadow-primary/25 touch-manipulation">
                    Start Free — No Credit Card
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#demo" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[48px] text-base px-6 sm:px-8 gap-2 touch-manipulation">
                    <Play className="h-4 w-4" />
                    See how it works
                  </Button>
                </a>
              </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-up animation-delay-600">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Free forever plan
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> 5 languages
                </span>
                <Link href="/integrations" className="flex items-center gap-1.5 text-primary hover:underline">
                  <Check className="h-4 w-4" /> Publish to 1000+ apps
                </Link>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" /> Post now or schedule
                </span>
              </div>
              {LANDING_USER_COUNT && (
                <p className="mt-4 text-sm font-medium text-muted-foreground animate-fade-up animation-delay-600">
                  Join <span className="text-foreground font-semibold">{LANDING_USER_COUNT} creators</span> saving 5+ hours every week
                </p>
              )}
            </div>

            {/* Right: Product Preview Mockup — responsive */}
            <div className="animate-slide-in-right animation-delay-400">
              <div className="relative max-w-full">
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl animate-glow-pulse" />
                <div className="relative bg-card border rounded-xl shadow-2xl overflow-hidden text-left">
                  {/* Mock toolbar */}
                  <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      repostai.com/dashboard
                    </span>
                  </div>
                  {/* Mock input */}
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      {[
                        { icon: Type, label: "Text" },
                        { icon: LinkIcon, label: "URL" },
                        { icon: Youtube, label: "YouTube" },
                        { icon: FileText, label: "PDF" },
                      ].map((tab, i) => (
                        <div
                          key={tab.label}
                          className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          <tab.icon className="h-3 w-3" />
                          {tab.label}
                        </div>
                      ))}
                    </div>
                    <div className="bg-muted/50 border rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
                      We just launched our new AI feature that helps teams
                      collaborate 10x faster. Here&apos;s what we learned building
                      it from scratch in 30 days...
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PLATFORMS.slice(0, 5).map((p) => (
                        <span
                          key={p.name}
                          className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full"
                        >
                          {p.name.split("/")[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Mock output */}
                  <div className="border-t bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">Generated</span>
                      <span className="text-[10px] text-muted-foreground">
                        0.8s
                      </span>
                    </div>
                    {[
                      { name: "LinkedIn", preview: "We just shipped something big. After 30 days of..." },
                      { name: "Twitter/X", preview: "1/ We built an AI feature in 30 days. Here's the..." },
                      { name: "Instagram", preview: "30 days. One AI feature. 10x faster collab..." },
                    ].map((out) => (
                      <div
                        key={out.name}
                        className="bg-card border rounded-lg p-2.5 flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="text-[10px] font-medium text-foreground">
                            {out.name}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                            {out.preview}
                          </p>
                        </div>
                        <div className="shrink-0 text-muted-foreground">
                          <Copy className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar — stacks on mobile */}
      <section className="py-6 sm:py-8 border-y bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 text-center">
            {LANDING_USER_COUNT ? (
              <div>
                <p className="text-2xl font-bold">Used by {LANDING_USER_COUNT} creators</p>
                <p className="text-xs text-muted-foreground">Join them</p>
              </div>
            ) : (
              <div>
                <Badge variant="secondary" className="mb-1">
                  New
                </Badge>
                <p className="text-sm font-medium">Be one of the first</p>
              </div>
            )}
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">5+</p>
              <p className="text-xs text-muted-foreground">Hours saved per week</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">60s</p>
              <p className="text-xs text-muted-foreground">To 9 platforms</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">9</p>
              <p className="text-xs text-muted-foreground">Platforms supported</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-sm font-medium">Free plan · No card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Quote cards — 1 col mobile, touch-friendly */}
      <section className="py-10 sm:py-16 bg-muted/20" aria-label="Testimonials">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <Badge variant="secondary" className="mb-3">
              Social proof
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Creators are saving hours every week
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Real results from people who switched to RepostAI
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {LANDING_TESTIMONIALS.map((t, i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="pt-6 pb-4 flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-primary">{t.beforeAfter}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">— {t.attribution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof carousel — scrollable quotes */}
      <section className="py-12 overflow-hidden" aria-label="What creators say">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground uppercase tracking-wider mb-6 font-medium">
            What creators say
          </p>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted" style={{ scrollbarWidth: "thin" }}>
            {LANDING_TESTIMONIALS.map((t, i) => (
              <Card key={i} className="min-w-[280px] sm:min-w-[320px] snap-center shrink-0">
                <CardContent className="pt-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">— {t.attribution}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling Input Types */}
      <section className="py-6 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">
            Works with any content source
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: "Blog Posts", icon: FileText },
              { name: "YouTube Videos", icon: Youtube },
              { name: "Podcast Notes", icon: MessageCircle },
              { name: "Articles", icon: FileText },
              { name: "Newsletters", icon: Mail },
              { name: "Twitter Threads", icon: Twitter },
              { name: "Website URLs", icon: LinkIcon },
              { name: "Plain Text", icon: Type },
            ].map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-card text-muted-foreground"
              >
                <item.icon className="h-3 w-3" />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video demo — 60-second generation in action */}
      <section id="demo" className="py-12 sm:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <Badge variant="secondary" className="mb-3">
              See it in action
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Watch: One post to every platform in 60 seconds
            </h2>
            <p className="text-muted-foreground">
              No fluff — just paste, click, and copy.
            </p>
          </div>
          <div className="relative rounded-xl overflow-hidden border bg-card shadow-xl aspect-video max-h-[400px] flex items-center justify-center">
            {LANDING_VIDEO_URL ? (
              <iframe
                src={
                  LANDING_VIDEO_URL.includes("youtube.com/watch")
                    ? LANDING_VIDEO_URL.replace("watch?v=", "embed/").split("&")[0]
                    : LANDING_VIDEO_URL
                }
                title="RepostAI 60-second demo"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <a href="#how-it-works" className="flex flex-col items-center justify-center gap-4 p-8 text-center group">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Play className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Demo video coming soon</p>
                  <p className="text-sm text-muted-foreground mt-1">See how it works below</p>
                </div>
                <Button variant="outline" size="sm">
                  How it works <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Before / After Comparison — case study */}
      <section className="py-12 sm:py-20" aria-label="Before and after case study">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Case study
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              The old way vs. the{" "}
              <span className="text-primary">RepostAI</span> way
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Before & after: how much time creators save per piece of content
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Before */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg">Without RepostAI</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Write blog post (2 hours)",
                    "Manually reformat for LinkedIn (30 min)",
                    "Create Twitter thread from scratch (20 min)",
                    "Write Instagram caption + hashtags (15 min)",
                    "Draft email newsletter intro (15 min)",
                    "Adapt for Facebook + Reddit (20 min)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-0.5">x</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-destructive/20">
                  <p className="text-sm font-medium">
                    Total: <span className="text-destructive">3-4 hours</span>{" "}
                    per piece of content
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-primary/30 bg-primary/5 shadow-lg shadow-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">With RepostAI</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Generate blog with AI or paste existing (5–10 min)",
                    "Paste into RepostAI (5 seconds)",
                    "Select all platforms (3 seconds)",
                    "Click 'Repurpose' (1 second)",
                    "AI generates all 9 platforms (< 60 seconds)",
                    "Post now with one click or schedule for later",
                    "Copy & paste to each platform (2 min)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-sm font-medium">
                    Total:{" "}
                    <span className="text-primary font-bold">Under 3 minutes</span>{" "}
                    for all platforms
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitor Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Honest Comparison
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See how RepostAI stacks up
            </h2>
            <p className="text-muted-foreground text-lg">
              We built what other tools should have been all along.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium text-muted-foreground">
                    Feature
                  </th>
                  <th className="p-3 border-b font-bold bg-primary/5 border-x border-primary/20 text-primary">
                    RepostAI
                  </th>
                  <th className="p-3 border-b font-medium text-muted-foreground">
                    Repurpose.io
                  </th>
                  <th className="p-3 border-b font-medium text-muted-foreground">
                    Lately AI
                  </th>
                  <th className="p-3 border-b font-medium text-muted-foreground hidden sm:table-cell">
                    Positiv
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "AI Content Generation", us: true, rep: false, lately: true, postiv: true },
                  { feature: "Post now (one-click publish)", us: true, rep: false, lately: true, postiv: true },
                  { feature: "Scheduled posting", us: true, rep: false, lately: true, postiv: true },
                  { feature: "Topic-to-Everywhere Flywheel", us: true, rep: false, lately: false, postiv: false },
                  { feature: "Brand Voice Training", us: true, rep: false, lately: true, postiv: false },
                  { feature: "9+ Text Platforms", us: true, rep: false, lately: true, postiv: false },
                  { feature: "URL Auto-Scraping", us: true, rep: false, lately: false, postiv: true },
                  { feature: "YouTube Transcription", us: true, rep: false, lately: false, postiv: false },
                  { feature: "One-Click All Platforms", us: true, rep: false, lately: false, postiv: false },
                  { feature: "Multi-Language (EN/HI/ES/PT/FR)", us: true, rep: false, lately: false, postiv: false },
                  { feature: "Free Plan Available", us: true, rep: false, lately: false, postiv: false },
                  { feature: "Starting Price", us: "$19/mo", rep: "$35/mo", lately: "$49/mo", postiv: "$99/mo" },
                ].map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="p-3 font-medium">{row.feature}</td>
                    <td className="p-3 text-center bg-primary/5 border-x border-primary/20">
                      {typeof row.us === "boolean" ? (
                        row.us ? (
                          <Check className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="font-bold text-primary">{row.us}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.rep === "boolean" ? (
                        row.rep ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.rep}</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {typeof row.lately === "boolean" ? (
                        row.lately ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.lately}</span>
                      )}
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      {typeof row.postiv === "boolean" ? (
                        row.postiv ? (
                          <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.postiv}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Dead Simple
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three steps. 60 seconds. Done.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: MousePointerClick,
                title: "Paste Your Content",
                description:
                  "Drop in a blog URL, YouTube link, or paste any text. We handle the extraction automatically.",
              },
              {
                step: "02",
                icon: Sparkles,
                title: "AI Repurposes It",
                description:
                  "Our AI generates platform-specific content for all 7+ platforms simultaneously. Brand voice included.",
              },
              {
                step: "03",
                icon: Copy,
                title: "Copy, post now, or schedule",
                description:
                  "One-click copy, post directly to Twitter/LinkedIn, or schedule for later. We post for you automatically.",
              },
            ].map((step, i) => (
              <div key={step.step} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
                )}
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 relative">
                  <step.icon className="h-7 w-7 text-primary" />
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-primary-foreground bg-primary rounded-full h-5 w-5 flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Built for Speed
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              No bloated feature lists. Just the tools that actually save you
              time.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "60-Second Generation",
                description:
                  "All platforms generated simultaneously. No waiting in queues.",
              },
              {
                icon: Globe,
                title: "9+ Platforms",
                description:
                  "LinkedIn, Twitter/X threads, Instagram, Facebook, Email, Reddit, TikTok, and WhatsApp Status — all at once.",
              },
              {
                icon: Sparkles,
                title: "Brand Voice Training",
                description:
                  "Feed it your writing samples. Output sounds like you, not ChatGPT.",
              },
              {
                icon: LinkIcon,
                title: "URL Auto-Scraping",
                description:
                  "Paste a blog URL. We extract the content automatically.",
              },
              {
                icon: Youtube,
                title: "YouTube Transcription",
                description:
                  "Paste a YouTube link. We grab the transcript and repurpose it.",
              },
              {
                icon: Copy,
                title: "One-Click Copy",
                description:
                  "Copy any output instantly. Edit inline if needed. Regenerate per platform.",
              },
              {
                icon: Send,
                title: "Post now",
                description:
                  "Connect Twitter or LinkedIn and publish directly from RepostAI. One click to post — no copy-paste.",
              },
              {
                icon: CalendarClock,
                title: "Schedule posts",
                description:
                  "Set a date and time; we post for you automatically. Perfect for queues and consistent publishing.",
              },
              {
                icon: Wand2,
                title: "AI Content Starter",
                description:
                  "Don't have a blog post? Tell us your topic, tone, and audience — AI writes a full draft, then auto-repurposes it everywhere.",
              },
              {
                icon: Globe,
                title: "Multi-Language Output",
                description:
                  "Generate content in English, Hindi, or Spanish. Reach global audiences competitors can't.",
              },
              {
                icon: Plug,
                title: "Publish to 1000+ apps",
                description:
                  "Connect via Zapier: 1-click publish to LinkedIn, Twitter, Instagram, schedule posts, and auto-post with API to your whole stack.",
              },
            ].map((feature) => {
              const isIntegrations = feature.title.startsWith("Publish to 1000+");
              const card = (
                <Card
                  className={`group hover:shadow-md hover:border-primary/30 transition-all duration-300 ${isIntegrations ? "cursor-pointer" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                    {isIntegrations && (
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3 hover:underline">
                        Integrations <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
              return isIntegrations ? (
                <Link href="/integrations" key={feature.title}>
                  {card}
                </Link>
              ) : (
                <div key={feature.title}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            One input. Nine platforms. Zero effort.
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Each output is crafted for that specific platform&apos;s audience and
            format.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => (
              <Card
                key={platform.name}
                className="group hover:shadow-md hover:border-primary/30 transition-all"
              >
                <CardContent className="py-5 text-center">
                  <div
                    className={`h-10 w-10 rounded-lg ${platform.color} flex items-center justify-center mx-auto mb-3`}
                  >
                    <platform.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">{platform.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for people who create content
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map((uc) => (
              <Card key={uc.title} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold mb-2">{uc.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {uc.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 sm:py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-16">
            <div className="text-center mb-4">
              <Badge variant="secondary" className="mb-4">
                Transparent, regional-friendly pricing
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Start free. Scale when ready.
              </h2>
              <p className="text-muted-foreground text-lg">
                No hidden fees. No surprises. Cancel anytime.
              </p>
            </div>
            <div className="flex justify-center">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                Market region:
                <select
                  value={pricingRegion}
                  onChange={(e) => setPricingRegion(e.target.value)}
                  className="border rounded-md px-2 py-1 bg-background text-foreground text-sm"
                >
                  {PRICING_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {Object.values(PLANS).map((plan) => (
              <Card
                key={plan.name}
                className={`relative transition-all ${plan.name === "Pro" ? "border-primary shadow-xl shadow-primary/10 scale-[1.03] z-10" : "hover:shadow-md"}`}
              >
                {plan.name === "Pro" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="pt-8 pb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {plan.name === "Free"
                      ? "For trying it out"
                      : plan.name === "Pro"
                        ? "For serious creators"
                        : "For agencies & teams"}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {pricingSymbol}
                      {plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground text-sm">
                        /month
                      </span>
                    )}
                    {plan.monthlyPrice > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        That&apos;s just {pricingSymbol}
                        {(plan.monthlyPrice / 30).toFixed(2)}/day
                      </p>
                    )}
                    {"annualPrice" in plan && (
                      <p className="text-xs text-primary mt-0.5">
                        or {pricingSymbol}
                        {plan.annualPrice}/mo billed annually (save 20%)
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block">
                    <Button
                      className={`w-full ${plan.name === "Pro" ? "shadow-md shadow-primary/25" : ""}`}
                      variant={plan.name === "Pro" ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.monthlyPrice === 0
                        ? "Start Free"
                        : `Get ${plan.name}`}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee + Trust Badges */}
      <section className="py-12 border-y">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
              <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">14-Day Money Back</p>
                <p className="text-xs text-muted-foreground">
                  Not happy? Full refund, no questions asked.
                </p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Free Forever Plan</p>
                <p className="text-xs text-muted-foreground">
                  No credit card required to start.
                </p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">5 Languages</p>
                <p className="text-xs text-muted-foreground">
                  English, Hindi, Spanish, Portuguese, and French.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-card border rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  A
                </div>
                <div>
                  <p className="font-bold text-lg">Hey, I&apos;m the founder</p>
                  <p className="text-sm text-muted-foreground">
                    Solo builder, content creator
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  I built RepostAI because I was tired of the same problem every
                  creator faces: you spend hours writing one great blog post, then
                  spend MORE hours reformatting it for LinkedIn, Twitter, Instagram,
                  and email. It&apos;s exhausting.
                </p>
                <p>
                  I tried every tool out there. Repurpose.io only does video
                  distribution — no AI, no text creation. Lately AI costs $49+/month
                  and is built for enterprises. Most &quot;AI tools&quot; just wrap
                  ChatGPT and produce generic slop that sounds nothing like you.
                </p>
                <p>
                  So I built what I actually wanted:{" "}
                  <span className="text-foreground font-medium">
                    paste your content, pick your platforms, get platform-native posts
                    that sound like YOU — in 60 seconds, for $19/month.
                  </span>
                </p>
                <p>
                  No VC funding. No bloated team. Just one developer building the
                  tool I wish existed. Every feature request goes straight to me, and
                  I ship weekly.
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-6 border-t">
                <Heart className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Built with care. Shipped with speed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <span className="font-medium text-sm pr-4">{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-4 pb-4 pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-purple-600" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative max-w-3xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to repurpose smarter?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Join creators who save 5+ hours every week. Start with 5 free
            repurposes today.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-base px-8 shadow-lg">
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm opacity-70 mt-4">
            No credit card required. Upgrade anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-8 mb-8">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold">RepostAI</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                AI-powered content repurposing. One post, every platform, under
                60 seconds.
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Product</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors">
                  Features
                </a>
                <Link href="/integrations" className="block hover:text-foreground transition-colors">
                  Integrations
                </Link>
                <a href="#pricing" className="block hover:text-foreground transition-colors">
                  Pricing
                </a>
                <a href="#faq" className="block hover:text-foreground transition-colors">
                  FAQ
                </a>
              </div>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">Legal</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="/privacy" className="block hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="block hover:text-foreground transition-colors">
                  Terms of Service
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="block hover:text-foreground transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
          <Separator className="mb-6" />
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} RepostAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
