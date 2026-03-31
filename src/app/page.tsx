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
  Heart,
  Wand2,
  Plug,
  Send,
  CalendarClock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PLANS, PLANS_PRICING, SUPPORT_EMAIL, LANDING_VIDEO_URL } from "@/config/constants";
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const pricingSymbol = PRICING_REGIONS.find((r) => r.id === pricingRegion)?.symbol ?? "$";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in-view"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function pf(template: string, vars: Record<string, string | number>): string {
    let s = template;
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Announcement Bar */}
      {!announcementDismissed && (
        <div className="bg-primary text-primary-foreground py-2 px-4 text-center text-xs sm:text-sm font-medium relative">
          AI Brand Voice is live — your content, your tone, always.{" "}
          <Link href="/signup" className="font-bold underline underline-offset-2 hover:no-underline">
            Try free →
          </Link>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <LandingNav />

      {/* ── HERO ── */}
      <section className="relative py-20 sm:py-28 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Text block */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight mb-5 leading-[1.08] animate-blur-in">
              {t("landing.heroTitle1")}{" "}
              <span className="text-primary">{t("landing.heroTitleHighlight")}</span>
              <br />
              {t("landing.heroTitle2")}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto animate-blur-in animation-delay-200 leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center animate-blur-in animation-delay-400">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="min-h-[52px] text-base px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200 font-semibold"
                >
                  {t("landing.ctaPrimary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a
                href="#demo"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                {t("landing.ctaSecondary")}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 justify-center text-sm text-muted-foreground animate-blur-in animation-delay-600">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" /> {t("landing.checkFreeForever")}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" /> {t("landing.checkNoCard")}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" /> {t("landing.checkSchedule")}
              </span>
              <Link href="/integrations" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Check className="h-3.5 w-3.5 text-primary" /> {t("landing.checkPublish")}
              </Link>
            </div>
          </div>

          {/* Product Mockup */}
          <div className="animate-scale-in animation-delay-400 max-w-2xl mx-auto">
            <div className="relative rounded-2xl border border-border/70 bg-card shadow-2xl shadow-black/8 overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-muted/80 border-b border-border/60 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono opacity-50">
                  {t("landing.mockUrl")}
                </span>
              </div>
              {/* Input area */}
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { icon: Type, labelKey: "landing.mockTabText" },
                    { icon: LinkIcon, labelKey: "landing.mockTabUrl" },
                    { icon: Youtube, labelKey: "landing.mockTabYoutube" },
                    { icon: FileText, labelKey: "landing.mockTabPdf" },
                  ].map((tab, i) => (
                    <div
                      key={tab.labelKey}
                      className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium ${
                        i === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <tab.icon className="h-3 w-3" />
                      {t(tab.labelKey)}
                    </div>
                  ))}
                </div>
                <div className="bg-muted/50 border border-border/50 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed">
                  {t("landing.mockSample")}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {L.platformsSection.names.slice(0, 5).map((name, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-primary/8 text-primary border border-primary/15 px-2 py-0.5 rounded-full font-medium"
                    >
                      {name.split("/")[0]}
                    </span>
                  ))}
                </div>
              </div>
              {/* Output preview */}
              <div className="border-t border-border/50 bg-muted/15 p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {t("landing.mockGenerated")}
                  </span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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
                    className="bg-card border border-border/50 rounded-xl p-3 flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="text-[10px] font-semibold">{out.name}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{out.preview}</p>
                    </div>
                    <Copy className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-8 border-y border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "5+ hrs", label: t("landing.proofHoursSaved") },
              { value: "< 60s", label: t("landing.proofToPlatforms") },
              { value: "9", label: t("landing.proofPlatformsSupported") },
            ].map((stat, i) => (
              <div key={i} className={i > 0 ? "border-l border-border/40" : ""}>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOURCE TYPES ── */}
      <section className="py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-5 font-semibold">
            {L.sourcesLabel}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
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
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground font-medium cursor-default"
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {L.howItWorks.title}
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm">
              Paste your content, pick your platforms, get platform-ready posts in seconds.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 relative" data-reveal>
            {([
              { ...L.howItWorks.steps[0], icon: MousePointerClick },
              { ...L.howItWorks.steps[1], icon: Sparkles },
              { ...L.howItWorks.steps[2], icon: Send },
            ] as const).map((step, i) => (
              <div key={step.step} className="bg-card border border-border/60 rounded-2xl p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <step.icon className="h-[18px] w-[18px] text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50 tracking-widest">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full border border-border/60 bg-card items-center justify-center">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO ── */}
      <section id="demo" className="py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              {L.demo.title}
            </h2>
            <p className="text-muted-foreground text-sm">{L.demo.subtitle}</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card aspect-video flex items-center justify-center">
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
              <a
                href="#how-it-works"
                className="flex flex-col items-center gap-4 p-8 text-center group"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{L.demo.placeholderTitle}</p>
                  <p className="text-sm text-muted-foreground mt-1">{L.demo.placeholderSubtitle}</p>
                </div>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="py-14 sm:py-20 bg-muted/20" aria-label="Before and after">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {L.caseStudy.titleBefore}{" "}
              <span className="text-primary">{L.caseStudy.titleBrand}</span>{" "}
              {L.caseStudy.titleAfter}
            </h2>
            <p className="text-muted-foreground text-sm">{L.caseStudy.subtitle}</p>
          </div>
          <div
            className="grid md:grid-cols-2 gap-px rounded-2xl overflow-hidden border border-border/40 bg-border/40"
            data-reveal
          >
            {/* Without */}
            <div className="bg-background p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="h-4 w-4 text-destructive/60 shrink-0" />
                <h3 className="font-semibold text-sm text-destructive/70">{L.caseStudy.withoutTitle}</h3>
              </div>
              <ul className="space-y-3">
                {L.caseStudy.beforeList.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <X className="h-3.5 w-3.5 text-destructive/40 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-border/40">
                <p className="text-sm font-semibold text-destructive/60">
                  {L.caseStudy.beforeTotal}{" "}
                  <span className="text-base text-destructive/80">{L.caseStudy.beforeHours}</span>{" "}
                  {L.caseStudy.beforePer}
                </p>
              </div>
            </div>
            {/* With RepostAI */}
            <div className="bg-primary/3 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-5">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm text-primary">{L.caseStudy.withTitle}</h3>
              </div>
              <ul className="space-y-3">
                {L.caseStudy.afterList.slice(0, 4).map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-primary/10">
                <p className="text-sm font-semibold">
                  {L.caseStudy.afterTotal}{" "}
                  <span className="text-primary text-base">{L.caseStudy.afterHighlight}</span>{" "}
                  {L.caseStudy.afterFor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {L.featuresSection.title}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              {L.featuresSection.subtitle}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" data-reveal>
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
              const content = (
                <div className="p-5 rounded-xl border border-border/60 bg-card hover:border-primary/25 transition-colors duration-200 h-full">
                  <Icon className="h-[18px] w-[18px] text-primary mb-3" />
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  {isIntegrations && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2">
                      {L.featuresSection.integrationsLink}{" "}
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              );
              return isIntegrations ? (
                <Link href="/integrations" key={id}>{content}</Link>
              ) : (
                <div key={id}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section className="py-12 sm:py-16 bg-muted/20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {L.platformsSection.title}
          </h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-md mx-auto">
            {L.platformsSection.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {L.platformsSection.names.map((name, idx) => {
              const platform = PLATFORM_ICONS[idx];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-card text-sm font-medium"
                >
                  {platform && (
                    <div className={`h-3.5 w-3.5 rounded-sm ${platform.color} flex items-center justify-center shrink-0`}>
                      <platform.icon className="h-2 w-2 text-white" />
                    </div>
                  )}
                  {name}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-16 sm:py-24" aria-label="Testimonials">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {L.testimonialSection.title}
            </h2>
            <p className="text-muted-foreground text-sm">{L.testimonialSection.subtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {L.testimonials.map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col"
              >
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-border/40">
                  <p className="text-xs font-semibold text-primary">{item.beforeAfter}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">— {item.attribution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-12 sm:py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {L.useCasesSection.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {L.useCasesSection.items.map((uc) => (
              <div key={uc.title} className="bg-card border border-border/60 rounded-xl p-6">
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              {L.pricingSection.title}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              {L.pricingSection.subtitle}
            </p>
          </div>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
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
            <div className="inline-flex rounded-lg border border-border/50 p-1 bg-muted/40">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
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
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {L.pricingSection.billingYearly}
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </div>
          {/* Cards */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
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
              const perDay = displayPrice > 0 ? (displayPrice / 30).toFixed(2) : "0";
              const isPro = plan.name === "Pro";
              return (
                <div
                  key={plan.name}
                  data-reveal
                  data-delay={String(planIdx + 1)}
                  className={`relative rounded-2xl p-6 transition-all duration-200 ${
                    isPro
                      ? "bg-primary text-primary-foreground ring-1 ring-primary shadow-xl shadow-primary/20"
                      : "bg-card border border-border/60 hover:border-border"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-[10px] font-bold px-3 py-1 bg-foreground text-background rounded-full uppercase tracking-wider whitespace-nowrap">
                        {L.pricingSection.mostPopular}
                      </span>
                    </div>
                  )}
                  <div className="mb-4 pt-2">
                    <h3 className={`text-base font-bold mb-0.5 ${isPro ? "text-primary-foreground" : ""}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-xs ${isPro ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {L.plans[plan.name as keyof typeof L.plans].subtitle}
                    </p>
                  </div>
                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      <span className={`text-4xl font-black tracking-tight ${isPro ? "text-primary-foreground" : ""}`}>
                        {pricingSymbol}{displayPrice}
                      </span>
                      {monthlyPrice > 0 && (
                        <span className={`text-sm mb-1 ${isPro ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {L.pricingSection.perMonth}
                        </span>
                      )}
                    </div>
                    {monthlyPrice > 0 && (
                      <p className={`text-xs mt-1 ${isPro ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {L.pricingSection.perDayPrefix} {pricingSymbol}{perDay}{L.pricingSection.perDaySuffix}
                      </p>
                    )}
                    {hasAnnual && billingCycle === "yearly" && (
                      <p className={`text-xs font-medium mt-1 ${isPro ? "text-primary-foreground/70" : "text-emerald-600 dark:text-emerald-400"}`}>
                        {pf(L.pricingSection.billedYearlyTotal, { symbol: pricingSymbol, total: annualPrice })}
                      </p>
                    )}
                    {hasAnnual && billingCycle === "monthly" && (
                      <p className={`text-xs mt-1 ${isPro ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {pf(L.pricingSection.saveVsMonthly, { symbol: pricingSymbol, save: monthlyPrice * 12 - annualPrice })}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {L.plans[plan.name as keyof typeof L.plans].features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check
                          className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                            isPro ? "text-primary-foreground/80" : "text-primary/70"
                          }`}
                        />
                        <span className={`text-xs leading-snug ${isPro ? "text-primary-foreground/90" : ""}`}>
                          {feature}
                        </span>
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
                      className={`w-full text-sm font-semibold ${
                        isPro
                          ? "bg-white text-primary hover:bg-white/95 dark:bg-primary-foreground dark:text-primary"
                          : ""
                      }`}
                      variant={isPro ? "ghost" : "outline"}
                      size="sm"
                    >
                      {monthlyPrice === 0
                        ? L.pricingSection.ctaFree
                        : pf(L.pricingSection.ctaPaid, { plan: plan.name })}
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="py-10 border-y border-border/40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                iconColor: "text-emerald-600 dark:text-emerald-400",
                title: L.trust.moneyTitle,
                sub: L.trust.moneySub,
              },
              {
                icon: Users,
                iconColor: "text-blue-600 dark:text-blue-400",
                title: L.trust.freeTitle,
                sub: L.trust.freeSub,
              },
              {
                icon: Globe,
                iconColor: "text-purple-600 dark:text-purple-400",
                title: L.trust.langTitle,
                sub: L.trust.langSub,
              },
            ].map((badge, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-border/40 bg-card">
                <badge.icon className={`h-5 w-5 ${badge.iconColor} shrink-0 mt-0.5`} />
                <div>
                  <p className="font-semibold text-sm">{badge.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-16 sm:py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10" data-reveal>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              {L.comparison.title}
            </h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              {L.comparison.subtitle}
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm" data-reveal>
            <table className="w-full text-sm border-collapse bg-card">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-[35%]">
                    {L.comparison.colFeature}
                  </th>
                  <th className="px-4 py-3 font-bold text-primary bg-primary/5 border-x border-primary/15 min-w-[100px]">
                    {L.comparison.colUs}
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground min-w-[90px]">
                    {L.comparison.colRep}
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground min-w-[90px]">
                    {L.comparison.colLately}
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell min-w-[90px]">
                    {L.comparison.colPostiv}
                  </th>
                </tr>
              </thead>
              <tbody>
                {L.comparison.rows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border/40 last:border-0 ${idx % 2 === 0 ? "bg-muted/20" : ""}`}
                  >
                    <td className="px-4 py-3 font-medium text-sm">{row.feature}</td>
                    <td className="px-4 py-3 text-center bg-primary/4 border-x border-primary/10">
                      {typeof row.us === "boolean" ? (
                        row.us ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )
                      ) : (
                        <span className="font-semibold text-primary text-xs">{row.us}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.rep === "boolean" ? (
                        row.rep ? (
                          <Check className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">{row.rep}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {typeof row.lately === "boolean" ? (
                        row.lately ? (
                          <Check className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )
                      ) : (
                        <span className="text-muted-foreground text-xs">{row.lately}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {typeof row.postiv === "boolean" ? (
                        row.postiv ? (
                          <Check className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )
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

      {/* ── FOUNDER ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4">
          <div data-reveal>
            <div className="bg-card border border-border/60 rounded-2xl p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold shadow-sm shrink-0">
                  {L.founder.avatarLetter}
                </div>
                <div>
                  <p className="font-bold">{L.founder.title}</p>
                  <p className="text-sm text-muted-foreground">{L.founder.role}</p>
                </div>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>{L.founder.p1}</p>
                <p>{L.founder.p2}</p>
                <p className="text-foreground font-medium">{L.founder.p3}</p>
                <p>{L.founder.p4}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-5 border-t border-border/40">
                <Heart className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">{L.founder.footer}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-12 sm:py-20 bg-muted/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{L.faqTitle}</h2>
          </div>
          <div className="divide-y divide-border/50">
            {L.faq.map((item) => (
              <details key={item.q} className="group py-1">
                <summary className="flex items-center justify-between cursor-pointer py-4 gap-4 list-none">
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 sm:py-28 bg-primary relative overflow-hidden">
        <div className="relative max-w-2xl mx-auto px-4 text-center text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            {L.finalCta.title}
          </h2>
          <p className="text-lg opacity-75 mb-8 max-w-md mx-auto leading-relaxed">
            {L.finalCta.subtitle}
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/95 dark:bg-primary-foreground dark:text-primary text-base px-8 font-semibold min-h-[52px] shadow-xl"
            >
              {L.finalCta.button} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <p className="text-sm opacity-55 mt-4">{L.finalCta.footnote}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14 border-t">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                  <Zap className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold tracking-tight">{t("brandName")}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                {L.footer.tagline}
              </p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">{L.footer.product}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#features" className="block hover:text-foreground transition-colors">
                  {L.footer.features}
                </a>
                <Link href="/integrations" className="block hover:text-foreground transition-colors">
                  {L.footer.integrations}
                </Link>
                <a href="#pricing" className="block hover:text-foreground transition-colors">
                  {L.footer.pricing}
                </a>
                <a href="#faq" className="block hover:text-foreground transition-colors">
                  {L.footer.faq}
                </a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">{L.footer.legal}</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/privacy" className="block hover:text-foreground transition-colors">
                  {L.footer.privacy}
                </Link>
                <Link href="/terms" className="block hover:text-foreground transition-colors">
                  {L.footer.terms}
                </Link>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="block hover:text-foreground transition-colors">
                  {L.footer.contact}
                </a>
              </div>
            </div>
          </div>
          <Separator className="mb-5 opacity-40" />
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {L.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
