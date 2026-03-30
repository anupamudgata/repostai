"use client";

import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PLANS, PLANS_PRICING, SUPPORT_EMAIL, LANDING_USER_COUNT, LANDING_VIDEO_URL } from "@/config/constants";
import { LandingNav } from "@/components/landing-nav";
import { useI18n } from "@/contexts/i18n-provider";
import { landingBulkEn } from "@/messages/landing-bulk.en";
import { landingBulkHi } from "@/messages/landing-bulk.hi";

const PRICING_REGIONS = [
  { id: "global", symbol: "$" },
  { id: "eu", symbol: "€" },
  { id: "uk", symbol: "£" },
  { id: "in", symbol: "₹" },
  { id: "latam", symbol: "$" },
] as const;

const PLATFORM_ICONS = [
  { icon: Linkedin, color: "bg-blue-600" },
  { icon: Twitter, color: "bg-sky-500" },
  { icon: Twitter, color: "bg-sky-500" },
  { icon: Instagram, color: "bg-pink-500" },
  { icon: Facebook, color: "bg-blue-500" },
  { icon: Mail, color: "bg-emerald-500" },
  { icon: MessageCircle, color: "bg-orange-500" },
  { icon: PlayIcon, color: "bg-black" },
  { icon: MessageCircle, color: "bg-green-500" },
];

export default function LandingPage() {
  const { t, locale } = useI18n();
  const L = locale === "hi" ? landingBulkHi : landingBulkEn;
  const [pricingRegion, setPricingRegion] = useState<string>("in");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const pricingSymbol =
    PRICING_REGIONS.find((r) => r.id === pricingRegion)?.symbol ?? "$";

  // Scroll-reveal: add .in-view to [data-reveal] elements when they enter viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function pf(
    template: string,
    vars: Record<string, string | number>
  ): string {
    let s = template;
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Announcement Bar */}
      {!announcementDismissed && (
        <div className="announcement-bar bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-primary-foreground py-2.5 px-4 text-center text-xs sm:text-sm font-medium relative">
          <span className="mr-2">✨</span>
          AI Brand Voice is live — your content, your tone, always.{" "}
          <Link href="/signup" className="font-bold underline underline-offset-2 hover:no-underline ml-1">
            Try free →
          </Link>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity text-primary-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <LandingNav />

      {/* Hero — Apple-style centered with dramatic visual */}
      <section className="relative py-16 sm:py-24 lg:py-32 hero-gradient overflow-hidden">
        {/* Animated ambient orbs */}
        <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-primary/10 blur-3xl animate-orb pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-purple-500/10 blur-3xl animate-orb pointer-events-none" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Centered text block */}
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <Badge
              variant="secondary"
              className="mb-5 sm:mb-7 animate-blur-in border border-primary/25 px-4 py-1.5 text-xs sm:text-sm font-medium shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              {t("landing.heroBadge")}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-5 sm:mb-7 animate-blur-in animation-delay-200 leading-[1.05]">
              {t("landing.heroTitle1")}{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-text">
                {t("landing.heroTitleHighlight")}
              </span>
              <br />
              {t("landing.heroTitle2")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto animate-blur-in animation-delay-400 leading-relaxed px-1 sm:px-0">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-blur-in animation-delay-600">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[52px] text-base px-8 sm:px-10 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:scale-[1.02] touch-manipulation font-semibold"
                >
                  {t("landing.ctaPrimary")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[52px] text-base px-8 sm:px-10 gap-2 touch-manipulation hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] font-medium"
                >
                  <Play className="h-4 w-4" />
                  {t("landing.ctaSecondary")}
                </Button>
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 justify-center text-sm text-muted-foreground animate-blur-in animation-delay-800">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {t("landing.checkFreeForever")}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {t("landing.checkNoCard")}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {t("landing.checkLanguages")}
              </span>
              <Link href="/integrations" className="flex items-center gap-1.5 text-primary hover:underline">
                <Check className="h-4 w-4" /> {t("landing.checkPublish")}
              </Link>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {t("landing.checkSchedule")}
              </span>
            </div>
            {LANDING_USER_COUNT && (
              <p className="mt-4 text-sm font-medium text-muted-foreground animate-blur-in animation-delay-1000">
                {t("landing.joinCreators", { count: LANDING_USER_COUNT })}
              </p>
            )}
          </div>

          {/* Product Mockup — centered, dramatic floating card */}
          <div className="animate-scale-in animation-delay-600 max-w-2xl mx-auto">
            <div className="relative">
              {/* Multi-layer glow */}
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-to-r from-primary/25 via-purple-500/25 to-pink-500/25 rounded-3xl blur-2xl animate-glow-pulse pointer-events-none" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-md pointer-events-none" />
              <div className="relative bg-card border rounded-2xl shadow-2xl overflow-hidden text-left">
                {/* Mock toolbar */}
                <div className="bg-muted/60 border-b px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">
                    {t("landing.mockUrl")}
                  </span>
                </div>
                {/* Mock input */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { icon: Type, labelKey: "landing.mockTabText" },
                      { icon: LinkIcon, labelKey: "landing.mockTabUrl" },
                      { icon: Youtube, labelKey: "landing.mockTabYoutube" },
                      { icon: FileText, labelKey: "landing.mockTabPdf" },
                    ].map((tab, i) => (
                      <div
                        key={tab.labelKey}
                        className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-all duration-200 ${
                          i === 0
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <tab.icon className="h-3 w-3" />
                        {t(tab.labelKey)}
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/50 border rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
                    {t("landing.mockSample")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORM_ICONS.slice(0, 5).map((p, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium"
                      >
                        {L.platformsSection.names[idx]?.split("/")[0] ?? ""}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Mock output */}
                <div className="border-t bg-gradient-to-b from-muted/20 to-muted/5 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {t("landing.mockGenerated")}
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      0.8s
                    </span>
                  </div>
                  {[
                    { name: L.platformsSection.names[0] ?? "LinkedIn", preview: "We just shipped something big. After 30 days of..." },
                    { name: (L.platformsSection.names[1] ?? "Twitter/X").split("/")[0] ?? "Twitter", preview: "1/ We built an AI feature in 30 days. Here's the..." },
                    { name: L.platformsSection.names[3] ?? "Instagram", preview: "30 days. One AI feature. 10x faster collab..." },
                  ].map((out) => (
                    <div
                      key={out.name}
                      className="bg-card border rounded-xl p-3 flex items-start justify-between gap-2 hover:border-primary/30 transition-colors duration-200"
                    >
                      <div>
                        <span className="text-[10px] font-semibold text-foreground">
                          {out.name}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {out.preview}
                        </p>
                      </div>
                      <div className="shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        <Copy className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar — premium stat strip */}
      <section className="py-8 sm:py-12 border-y bg-gradient-to-r from-muted/20 via-muted/40 to-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 text-center">
            {[
              {
                value: LANDING_USER_COUNT ? t("landing.proofUsedBy", { count: LANDING_USER_COUNT }) : "★ New",
                label: LANDING_USER_COUNT ? t("landing.proofJoinThem") : t("landing.proofFirst"),
              },
              { value: "5+ hrs", label: t("landing.proofHoursSaved") },
              { value: "60s", label: t("landing.proofToPlatforms") },
              { value: "9", label: t("landing.proofPlatformsSupported") },
            ].map((stat, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-1 ${i > 0 ? "sm:border-l sm:border-border/60" : ""}`}
              >
                <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Quote cards — premium glass cards */}
      <section className="py-12 sm:py-20 bg-muted/15" aria-label="Testimonials">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
              {L.testimonialSection.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              {L.testimonialSection.title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
              {L.testimonialSection.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {L.testimonials.map((item, i) => (
              <Card key={i} className="flex flex-col card-hover border-border/60 hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-5 pb-4 flex flex-col flex-1">
                  <div className="text-2xl text-primary/40 font-serif leading-none mb-2">&ldquo;</div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {item.quote}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/60">
                    <p className="text-xs font-semibold text-primary">{item.beforeAfter}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">— {item.attribution}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Scrolling Input Types */}
      <section className="py-8 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5 font-semibold letter-spacing-wider">
            {L.sourcesLabel}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: L.sourceChips[0], icon: FileText },
              { label: L.sourceChips[1], icon: Youtube },
              { label: L.sourceChips[2], icon: MessageCircle },
              { label: L.sourceChips[3], icon: FileText },
              { label: L.sourceChips[4], icon: Mail },
              { label: L.sourceChips[5], icon: Twitter },
              { label: L.sourceChips[6], icon: LinkIcon },
              { label: L.sourceChips[7], icon: Type },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full border border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 cursor-default font-medium shadow-sm"
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video demo — 60-second generation in action */}
      <section id="demo" className="py-14 sm:py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-3xl rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-10 sm:mb-14">
            <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
              {L.demo.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              {L.demo.title}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {L.demo.subtitle}
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card shadow-2xl shadow-primary/10 aspect-video max-h-[420px] flex items-center justify-center">
            {LANDING_VIDEO_URL ? (
              <iframe
                src={
                  LANDING_VIDEO_URL.includes("youtube.com/watch")
                    ? LANDING_VIDEO_URL.replace("watch?v=", "embed/").split("&")[0]
                    : LANDING_VIDEO_URL
                }
                title={L.demo.iframeTitle}
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
                  <p className="font-semibold">{L.demo.placeholderTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{L.demo.placeholderSubtitle}</p>
                </div>
                <Button variant="outline" size="sm">
                  {L.demo.cta} <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Before / After Comparison — cinematic transformation */}
      <section className="py-14 sm:py-24" aria-label="Before and after case study">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16" data-reveal>
            <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
              {L.caseStudy.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {L.caseStudy.titleBefore}{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {L.caseStudy.titleBrand}
              </span>{" "}
              {L.caseStudy.titleAfter}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base sm:text-lg">
              {L.caseStudy.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-border/60 shadow-xl shadow-primary/5" data-reveal data-delay="2">
            {/* Without */}
            <div className="bg-destructive/4 border-r border-border/60 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="font-bold text-lg text-destructive/90">{L.caseStudy.withoutTitle}</h3>
              </div>
              <ul className="space-y-3.5">
                {L.caseStudy.beforeList.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <X className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-5 border-t border-destructive/15">
                <p className="text-sm font-semibold text-destructive/80">
                  {L.caseStudy.beforeTotal}{" "}{L.caseStudy.beforeHours}{" "}{L.caseStudy.beforePer}
                </p>
              </div>
            </div>

            {/* With RepostAI */}
            <div className="bg-gradient-to-br from-primary/8 to-purple-500/5 p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-primary">{L.caseStudy.withTitle}</h3>
                </div>
                <ul className="space-y-3.5">
                  {L.caseStudy.afterList.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-primary/15">
                  <p className="text-sm font-semibold">
                    {L.caseStudy.afterTotal}{" "}
                    <span className="text-primary">{L.caseStudy.afterHighlight}</span>{" "}
                    {L.caseStudy.afterFor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Comparison Table — premium rounded design */}
      <section className="py-16 sm:py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16" data-reveal>
            <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
              {L.comparison.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              {L.comparison.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {L.comparison.subtitle}
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-lg" data-reveal data-delay="2">
            <table className="w-full text-sm border-collapse bg-card">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left px-5 py-4 font-semibold text-muted-foreground w-[35%]">
                    {L.comparison.colFeature}
                  </th>
                  <th className="px-5 py-4 font-bold bg-primary/8 text-primary border-x border-primary/20 min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                        <Zap className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      {L.comparison.colUs}
                    </div>
                  </th>
                  <th className="px-5 py-4 font-medium text-muted-foreground min-w-[90px]">
                    {L.comparison.colRep}
                  </th>
                  <th className="px-5 py-4 font-medium text-muted-foreground min-w-[90px]">
                    {L.comparison.colLately}
                  </th>
                  <th className="px-5 py-4 font-medium text-muted-foreground hidden sm:table-cell min-w-[90px]">
                    {L.comparison.colPostiv}
                  </th>
                </tr>
              </thead>
              <tbody>
                {L.comparison.rows.map((row, idx) => (
                  <tr key={row.feature} className={`border-b border-border/40 last:border-0 ${idx % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <td className="px-5 py-3.5 font-medium text-sm">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center bg-primary/6 border-x border-primary/15">
                      {typeof row.us === "boolean" ? (
                        row.us ? (
                          <div className="flex justify-center">
                            <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center">
                              <Check className="h-3.5 w-3.5 text-primary" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )
                      ) : (
                        <span className="font-bold text-primary text-xs">{row.us}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {typeof row.rep === "boolean" ? (
                        row.rep ? <Check className="h-4 w-4 text-muted-foreground/50 mx-auto" /> : <span className="text-muted-foreground/40 text-xs">—</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">{row.rep}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {typeof row.lately === "boolean" ? (
                        row.lately ? <Check className="h-4 w-4 text-muted-foreground/50 mx-auto" /> : <span className="text-muted-foreground/40 text-xs">—</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">{row.lately}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                      {typeof row.postiv === "boolean" ? (
                        row.postiv ? <Check className="h-4 w-4 text-muted-foreground/50 mx-auto" /> : <span className="text-muted-foreground/40 text-xs">—</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">{row.postiv}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works — numbered staggered layout */}
      <section id="how-it-works" className="py-16 sm:py-28 bg-muted/20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-20" data-reveal>
            <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
              {L.howItWorks.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {L.howItWorks.title}
            </h2>
          </div>

          <div className="space-y-16 sm:space-y-20">
            {([
              { ...L.howItWorks.steps[0], icon: MousePointerClick, color: "from-blue-500/20 to-primary/10", iconColor: "text-blue-500" },
              { ...L.howItWorks.steps[1], icon: Sparkles, color: "from-purple-500/20 to-pink-500/10", iconColor: "text-purple-500" },
              { ...L.howItWorks.steps[2], icon: Send, color: "from-emerald-500/20 to-primary/10", iconColor: "text-emerald-500" },
            ] as const).map((step, i) => (
              <div
                key={String(step.step)}
                data-reveal
                data-delay={String(i + 1)}
                className={`grid md:grid-cols-2 gap-8 sm:gap-12 items-center ${i % 2 === 1 ? "md:[grid-template-areas:'b_a']" : ""}`}
              >
                {/* Text side */}
                <div className={i % 2 === 1 ? "md:[grid-area:a]" : ""}>
                  <div className="step-number mb-2">0{i + 1}</div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 -mt-2">{step.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {/* Visual card side */}
                <div className={i % 2 === 1 ? "md:[grid-area:b]" : ""}>
                  <div className={`rounded-2xl bg-gradient-to-br ${step.color} border border-border/40 p-8 sm:p-10 flex items-center justify-center min-h-[160px] relative overflow-hidden`}>
                    <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
                    <div className="relative flex flex-col items-center gap-3 text-center">
                      <div className={`h-16 w-16 rounded-2xl bg-white/80 dark:bg-card/80 shadow-lg flex items-center justify-center`}>
                        <step.icon className={`h-8 w-8 ${step.iconColor}`} />
                      </div>
                      <p className={`text-sm font-semibold ${step.iconColor}`}>{step.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14 sm:mb-16" data-reveal>
            <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
              {L.featuresSection.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              {L.featuresSection.title}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {L.featuresSection.subtitle}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(
              [
                ["speed", Zap],
                ["platforms", Globe],
                ["brandVoice", Sparkles],
                ["url", LinkIcon],
                ["youtube", Youtube],
                ["copy", Copy],
                ["postNow", Send],
                ["schedule", CalendarClock],
                ["starter", Wand2],
                ["multilang", Globe],
                ["integrations", Plug],
              ] as const
            ).map(([id, Icon]) => {
              const feature = L.featuresSection.items.find((f) => f.id === id);
              if (!feature) return null;
              const isIntegrations = id === "integrations";
              const card = (
                <Card
                  className={`group card-hover border-border/60 hover:border-primary/30 transition-all duration-300 ${isIntegrations ? "cursor-pointer" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-4 group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-300 shadow-sm">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors duration-200">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    {isIntegrations && (
                      <span className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-3 hover:underline">
                        {L.featuresSection.integrationsLink}{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
              return isIntegrations ? (
                <Link href="/integrations" key={id}>
                  {card}
                </Link>
              ) : (
                <div key={id}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 sm:py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/4 blur-3xl rounded-full" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            {L.platformsSection.title}
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto">
            {L.platformsSection.subtitle}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 sm:gap-4">
            {PLATFORM_ICONS.map((platform, idx) => (
              <Card
                key={idx}
                className="group card-hover border-border/50 hover:border-primary/30"
              >
                <CardContent className="py-5 text-center">
                  <div
                    className={`h-11 w-11 rounded-xl ${platform.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                  >
                    <platform.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-semibold text-sm">
                    {L.platformsSection.names[idx]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              {L.useCasesSection.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
            {L.useCasesSection.items.map((uc) => (
              <Card key={uc.title} className="card-hover border-border/60 hover:border-primary/30 group">
                <CardContent className="pt-6">
                  <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors duration-200">{uc.title}</h3>
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
      <section id="pricing" className="py-14 sm:py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/4 blur-3xl rounded-full" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative">
          <div className="mb-14 sm:mb-16" data-reveal>
            <div className="text-center mb-6">
              <Badge variant="secondary" className="mb-4 border border-primary/20 px-3 py-1">
                {L.pricingSection.badge}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
                {L.pricingSection.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                {L.pricingSection.subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                {L.pricingMarketLabel}
                <select
                  value={pricingRegion}
                  onChange={(e) => setPricingRegion(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 bg-background text-foreground text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  {PRICING_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {L.pricingRegions[r.id]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="inline-flex rounded-xl border border-border/60 p-1 bg-muted/50 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    billingCycle === "monthly"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {L.pricingSection.billingMonthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {L.pricingSection.billingYearly}
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
            {Object.values(PLANS).map((plan, planIdx) => {
              const regionPricing = PLANS_PRICING[plan.name];
              const monthlyPrice = regionPricing?.monthly[pricingRegion] ?? 0;
              const annualPrice = regionPricing?.annual[pricingRegion] ?? 0;
              const hasAnnual = monthlyPrice > 0;
              const displayPrice = regionPricing
                ? billingCycle === "yearly" && hasAnnual
                  ? Math.round(annualPrice / 12)
                  : monthlyPrice
                : 0;
              const perDay =
                displayPrice > 0 ? (displayPrice / 30).toFixed(2) : "0";
              const isPro = plan.name === "Pro";
              return (
              <div
                key={plan.name}
                data-reveal
                data-delay={String(planIdx + 1)}
                className={`relative rounded-2xl transition-all duration-300 ${
                  isPro
                    ? "bg-gradient-to-b from-primary/8 to-card border-2 border-primary shadow-2xl shadow-primary/15 md:scale-[1.04] z-10"
                    : "bg-card border border-border/60 hover:border-primary/30 hover:shadow-md"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="badge-pulse shadow-lg shadow-primary/30 px-3 py-1 font-semibold">
                      ✨ {L.pricingSection.mostPopular}
                    </Badge>
                  </div>
                )}
                <div className="p-6 pt-8">
                  <div className="mb-5">
                    <h3 className={`text-lg font-bold mb-1 ${isPro ? "text-primary" : ""}`}>{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {L.plans[plan.name as keyof typeof L.plans].subtitle}
                    </p>
                  </div>
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-black tracking-tight">
                        {pricingSymbol}{displayPrice}
                      </span>
                      {monthlyPrice > 0 && (
                        <span className="text-muted-foreground text-sm mb-1">
                          {L.pricingSection.perMonth}
                        </span>
                      )}
                    </div>
                    {monthlyPrice > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {L.pricingSection.perDayPrefix} {pricingSymbol}{perDay}{L.pricingSection.perDaySuffix}
                      </p>
                    )}
                    {hasAnnual && billingCycle === "yearly" && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        {pf(L.pricingSection.billedYearlyTotal, { symbol: pricingSymbol, total: annualPrice })}
                      </p>
                    )}
                    {hasAnnual && billingCycle === "monthly" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pf(L.pricingSection.saveVsMonthly, { symbol: pricingSymbol, save: monthlyPrice * 12 - annualPrice })}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {L.plans[plan.name as keyof typeof L.plans].features.map(
                      (feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${isPro ? "text-primary" : "text-primary/70"}`} />
                        <span className="text-sm leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={
                      monthlyPrice === 0
                        ? "/signup"
                        : `/signup?plan=${plan.name.toLowerCase()}&billing=${billingCycle === "yearly" ? "annual" : "monthly"}`
                    }
                    className="block"
                  >
                    <Button
                      className={`w-full font-semibold transition-all duration-300 ${
                        isPro ? "shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02]" : ""
                      }`}
                      variant={isPro ? "default" : "outline"}
                      size="lg"
                    >
                      {monthlyPrice === 0
                        ? L.pricingSection.ctaFree
                        : pf(L.pricingSection.ctaPaid, { plan: plan.name })}
                    </Button>
                  </Link>
                </div>
              </div>
            );
            })}
          </div>
          <div className="mt-16 grid sm:grid-cols-3 gap-6">
            {L.testimonials.slice(0, 3).map((item, i) => (
              <Card key={i} className="border-muted-foreground/15 bg-background/60">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="text-xs font-medium mt-3">{item.attribution}</p>
                  <p className="text-xs text-primary mt-0.5">{item.beforeAfter}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee + Trust Badges */}
      <section className="py-12 sm:py-16 border-y bg-gradient-to-r from-muted/10 via-muted/30 to-muted/10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left" data-reveal>
            {[
              {
                icon: Shield,
                iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
                iconColor: "text-emerald-600 dark:text-emerald-400",
                title: L.trust.moneyTitle,
                sub: L.trust.moneySub,
              },
              {
                icon: Users,
                iconBg: "bg-blue-100 dark:bg-blue-900/30",
                iconColor: "text-blue-600 dark:text-blue-400",
                title: L.trust.freeTitle,
                sub: L.trust.freeSub,
              },
              {
                icon: Globe,
                iconBg: "bg-purple-100 dark:bg-purple-900/30",
                iconColor: "text-purple-600 dark:text-purple-400",
                title: L.trust.langTitle,
                sub: L.trust.langSub,
              },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-colors duration-200">
                <div className={`h-12 w-12 rounded-2xl ${badge.iconBg} flex items-center justify-center shrink-0`}>
                  <badge.icon className={`h-6 w-6 ${badge.iconColor}`} />
                </div>
                <div>
                  <p className="font-bold text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative" data-reveal>
            {/* Glow behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-purple-500/8 to-pink-500/10 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative bg-card border border-border/60 rounded-2xl p-8 sm:p-10 overflow-hidden">
              {/* Decorative top-right corner */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/12 via-purple-500/6 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/6 to-transparent pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-4 mb-7">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/30">
                    {L.founder.avatarLetter}
                  </div>
                  <div>
                    <p className="font-bold text-xl tracking-tight">{L.founder.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                      {L.founder.role}
                    </p>
                  </div>
                </div>
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  <p>{L.founder.p1}</p>
                  <p>{L.founder.p2}</p>
                  <p className="text-foreground font-semibold text-base">{L.founder.p3}</p>
                  <p>{L.founder.p4}</p>
                </div>
                <div className="flex items-center gap-2 mt-7 pt-6 border-t border-border/60">
                  <Heart className="h-4 w-4 text-primary fill-primary/30" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {L.founder.footer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-12 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
              {L.faqTitle}
            </h2>
          </div>
          <div className="space-y-3">
            {L.faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none p-4 sm:p-5 rounded-xl border border-border/60 bg-card hover:bg-muted/40 hover:border-primary/30 transition-all duration-200">
                  <span className="font-medium text-sm pr-4">{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform duration-300" />
                </summary>
                <div className="px-5 pb-4 pt-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — Apple-style dramatic gradient */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-purple-600 to-pink-600" />
        <div className="absolute inset-0 grid-pattern opacity-8" />
        {/* Ambient glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-orb pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-orb pointer-events-none" style={{ animationDelay: "4s" }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 tracking-tight">
            {L.finalCta.title}
          </h2>
          <p className="text-lg sm:text-xl opacity-85 mb-10 max-w-xl mx-auto leading-relaxed">
            {L.finalCta.subtitle}
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-10 shadow-2xl hover:scale-[1.03] transition-all duration-300 font-semibold min-h-[52px]"
            >
              {L.finalCta.button} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm opacity-65 mt-5">
            {L.finalCta.footnote}
          </p>
        </div>
      </section>

      {/* Footer — clean premium */}
      <footer className="py-14 border-t bg-muted/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg tracking-tight">{t("brandName")}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {L.footer.tagline}
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">{L.footer.product}</p>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.features}
                </a>
                <Link href="/integrations" className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.integrations}
                </Link>
                <a href="#pricing" className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.pricing}
                </a>
                <a href="#faq" className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.faq}
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-4">{L.footer.legal}</p>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                <Link href="/privacy" className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.privacy}
                </Link>
                <Link href="/terms" className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.terms}
                </Link>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="block hover:text-foreground transition-colors duration-200">
                  {L.footer.contact}
                </a>
              </div>
            </div>
          </div>
          <Separator className="mb-6 opacity-60" />
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {L.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
