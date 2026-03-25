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
import { PLANS, SUPPORT_EMAIL, LANDING_USER_COUNT, LANDING_VIDEO_URL } from "@/config/constants";
import { LandingNav } from "@/components/landing-nav";
import { useI18n } from "@/contexts/i18n-provider";
import { landingBulkEn } from "@/messages/landing-bulk.en";
import { landingBulkHi } from "@/messages/landing-bulk.hi";

const PRICING_REGIONS = [
  { id: "global", symbol: "$" },
  { id: "eu", symbol: "€" },
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
  const pricingSymbol =
    PRICING_REGIONS.find((r) => r.id === pricingRegion)?.symbol ?? "$";

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
                {t("landing.heroBadge")}
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 animate-fade-up animation-delay-200">
                {t("landing.heroTitle1")}{" "}
                <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  {t("landing.heroTitleHighlight")}
                </span>
                <br />
                {t("landing.heroTitle2")}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 animate-fade-up animation-delay-400 px-1 sm:px-0">
                {t("landing.heroSubtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-up animation-delay-600">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto min-h-[48px] text-base px-6 sm:px-8 shadow-lg shadow-primary/25 touch-manipulation">
                    {t("landing.ctaPrimary")}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#demo" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto min-h-[48px] text-base px-6 sm:px-8 gap-2 touch-manipulation">
                    <Play className="h-4 w-4" />
                    {t("landing.ctaSecondary")}
                  </Button>
                </a>
              </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 justify-center lg:justify-start text-sm text-muted-foreground animate-fade-up animation-delay-600">
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
                <p className="mt-4 text-sm font-medium text-muted-foreground animate-fade-up animation-delay-600">
                  {t("landing.joinCreators", { count: LANDING_USER_COUNT })}
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
                      {t("landing.mockUrl")}
                    </span>
                  </div>
                  {/* Mock input */}
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      {[
                        { icon: Type, labelKey: "landing.mockTabText" },
                        { icon: LinkIcon, labelKey: "landing.mockTabUrl" },
                        { icon: Youtube, labelKey: "landing.mockTabYoutube" },
                        { icon: FileText, labelKey: "landing.mockTabPdf" },
                      ].map((tab, i) => (
                        <div
                          key={tab.labelKey}
                          className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-1 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                        >
                          <tab.icon className="h-3 w-3" />
                          {t(tab.labelKey)}
                        </div>
                      ))}
                    </div>
                    <div className="bg-muted/50 border rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
                      {t("landing.mockSample")}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PLATFORM_ICONS.slice(0, 5).map((p, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full"
                        >
                          {L.platformsSection.names[idx]?.split("/")[0] ?? ""}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Mock output */}
                  <div className="border-t bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-primary">{t("landing.mockGenerated")}</span>
                      <span className="text-[10px] text-muted-foreground">
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
                <p className="text-2xl font-bold">
                  {t("landing.proofUsedBy", { count: LANDING_USER_COUNT })}
                </p>
                <p className="text-xs text-muted-foreground">{t("landing.proofJoinThem")}</p>
              </div>
            ) : (
              <div>
                <Badge variant="secondary" className="mb-1">
                  {t("landing.proofNew")}
                </Badge>
                <p className="text-sm font-medium">{t("landing.proofFirst")}</p>
              </div>
            )}
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">5+</p>
              <p className="text-xs text-muted-foreground">{t("landing.proofHoursSaved")}</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">60s</p>
              <p className="text-xs text-muted-foreground">{t("landing.proofToPlatforms")}</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">9</p>
              <p className="text-xs text-muted-foreground">{t("landing.proofPlatformsSupported")}</p>
            </div>
            <Separator orientation="vertical" className="h-6 w-px hidden sm:block" />
            <div>
              <p className="text-sm font-medium">{t("landing.proofFreeLine")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Quote cards — 1 col mobile, touch-friendly */}
      <section className="py-10 sm:py-16 bg-muted/20" aria-label="Testimonials">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <Badge variant="secondary" className="mb-3">
              {L.testimonialSection.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {L.testimonialSection.title}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {L.testimonialSection.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {L.testimonials.map((item, i) => (
              <Card key={i} className="flex flex-col">
                <CardContent className="pt-6 pb-4 flex flex-col flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-primary">{item.beforeAfter}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">— {item.attribution}</p>
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
            {L.carouselTitle}
          </p>
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted" style={{ scrollbarWidth: "thin" }}>
            {L.testimonials.map((item, i) => (
              <Card key={i} className="min-w-[280px] sm:min-w-[320px] snap-center shrink-0">
                <CardContent className="pt-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">— {item.attribution}</p>
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
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-card text-muted-foreground"
              >
                <item.icon className="h-3 w-3" />
                {item.label}
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
              {L.demo.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              {L.demo.title}
            </h2>
            <p className="text-muted-foreground">
              {L.demo.subtitle}
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

      {/* Before / After Comparison — case study */}
      <section className="py-12 sm:py-20" aria-label="Before and after case study">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              {L.caseStudy.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {L.caseStudy.titleBefore}{" "}
              <span className="text-primary">{L.caseStudy.titleBrand}</span>{" "}
              {L.caseStudy.titleAfter}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {L.caseStudy.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg">{L.caseStudy.withoutTitle}</h3>
                </div>
                <ul className="space-y-3">
                  {L.caseStudy.beforeList.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive mt-0.5">x</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-destructive/20">
                  <p className="text-sm font-medium">
                    {L.caseStudy.beforeTotal}{" "}
                    <span className="text-destructive">{L.caseStudy.beforeHours}</span>{" "}
                    {L.caseStudy.beforePer}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5 shadow-lg shadow-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{L.caseStudy.withTitle}</h3>
                </div>
                <ul className="space-y-3">
                  {L.caseStudy.afterList.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <p className="text-sm font-medium">
                    {L.caseStudy.afterTotal}{" "}
                    <span className="text-primary font-bold">{L.caseStudy.afterHighlight}</span>{" "}
                    {L.caseStudy.afterFor}
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
              {L.comparison.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {L.comparison.title}
            </h2>
            <p className="text-muted-foreground text-lg">
              {L.comparison.subtitle}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium text-muted-foreground">
                    {L.comparison.colFeature}
                  </th>
                  <th className="p-3 border-b font-bold bg-primary/5 border-x border-primary/20 text-primary">
                    {L.comparison.colUs}
                  </th>
                  <th className="p-3 border-b font-medium text-muted-foreground">
                    {L.comparison.colRep}
                  </th>
                  <th className="p-3 border-b font-medium text-muted-foreground">
                    {L.comparison.colLately}
                  </th>
                  <th className="p-3 border-b font-medium text-muted-foreground hidden sm:table-cell">
                    {L.comparison.colPostiv}
                  </th>
                </tr>
              </thead>
              <tbody>
                {L.comparison.rows.map((row) => (
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
              {L.howItWorks.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {L.howItWorks.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { ...L.howItWorks.steps[0], icon: MousePointerClick },
              { ...L.howItWorks.steps[1], icon: Sparkles },
              { ...L.howItWorks.steps[2], icon: Copy },
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
              {L.featuresSection.badge}
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
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
                  className={`group hover:shadow-md hover:border-primary/30 transition-all duration-300 ${isIntegrations ? "cursor-pointer" : ""}`}
                >
                  <CardContent className="pt-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1.5">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
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
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            {L.platformsSection.title}
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            {L.platformsSection.subtitle}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PLATFORM_ICONS.map((platform, idx) => (
              <Card
                key={idx}
                className="group hover:shadow-md hover:border-primary/30 transition-all"
              >
                <CardContent className="py-5 text-center">
                  <div
                    className={`h-10 w-10 rounded-lg ${platform.color} flex items-center justify-center mx-auto mb-3`}
                  >
                    <platform.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="font-medium text-sm">
                    {L.platformsSection.names[idx]}
                  </p>
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
              {L.useCasesSection.title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {L.useCasesSection.items.map((uc) => (
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
                {L.pricingSection.badge}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {L.pricingSection.title}
              </h2>
              <p className="text-muted-foreground text-lg">
                {L.pricingSection.subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                {L.pricingMarketLabel}
                <select
                  value={pricingRegion}
                  onChange={(e) => setPricingRegion(e.target.value)}
                  className="border rounded-md px-2 py-1 bg-background text-foreground text-sm"
                >
                  {PRICING_REGIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {L.pricingRegions[r.id]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="inline-flex rounded-lg border p-1 bg-muted/40">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {L.pricingSection.billingMonthly}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    billingCycle === "yearly"
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {L.pricingSection.billingYearly}
                </button>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
            {Object.values(PLANS).map((plan) => {
              const hasAnnual = "annualPrice" in plan && plan.monthlyPrice > 0;
              const displayPrice =
                plan.monthlyPrice === 0
                  ? 0
                  : billingCycle === "yearly" && hasAnnual
                    ? Math.round(plan.annualPrice / 12)
                    : plan.monthlyPrice;
              const perDay =
                displayPrice > 0 ? (displayPrice / 30).toFixed(2) : "0";
              return (
              <Card
                key={plan.name}
                className={`relative transition-all ${plan.name === "Pro" ? "border-primary shadow-xl shadow-primary/10 bg-gradient-to-b from-primary/5 to-transparent md:scale-[1.03] z-10" : "hover:shadow-md"}`}
              >
                {plan.name === "Pro" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">
                    {L.pricingSection.mostPopular}
                  </Badge>
                )}
                <CardContent className="pt-8 pb-6">
                  <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {L.plans[plan.name as keyof typeof L.plans].subtitle}
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {pricingSymbol}
                      {displayPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground text-sm">
                        {L.pricingSection.perMonth}
                      </span>
                    )}
                    {plan.monthlyPrice > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {L.pricingSection.perDayPrefix} {pricingSymbol}
                        {perDay}
                        {L.pricingSection.perDaySuffix}
                      </p>
                    )}
                    {hasAnnual && billingCycle === "yearly" && (
                      <p className="text-xs text-primary mt-0.5">
                        {pf(L.pricingSection.billedYearlyTotal, {
                          symbol: pricingSymbol,
                          total: plan.annualPrice,
                        })}
                      </p>
                    )}
                    {hasAnnual && billingCycle === "monthly" && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {pf(L.pricingSection.saveVsMonthly, {
                          symbol: pricingSymbol,
                          save: plan.monthlyPrice * 12 - plan.annualPrice,
                        })}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-8">
                    {L.plans[plan.name as keyof typeof L.plans].features.map(
                      (feature) => (
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
                        ? L.pricingSection.ctaFree
                        : pf(L.pricingSection.ctaPaid, { plan: plan.name })}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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
      <section className="py-12 border-y">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-center">
              <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{L.trust.moneyTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {L.trust.moneySub}
                </p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{L.trust.freeTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {L.trust.freeSub}
                </p>
              </div>
            </div>
            <Separator orientation="vertical" className="h-10 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{L.trust.langTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {L.trust.langSub}
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
                  {L.founder.avatarLetter}
                </div>
                <div>
                  <p className="font-bold text-lg">{L.founder.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {L.founder.role}
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>{L.founder.p1}</p>
                <p>{L.founder.p2}</p>
                <p className="text-foreground font-medium">{L.founder.p3}</p>
                <p>{L.founder.p4}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-6 border-t">
                <Heart className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  {L.founder.footer}
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
              {L.faqTitle}
            </h2>
          </div>
          <div className="space-y-4">
            {L.faq.map((item) => (
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
            {L.finalCta.title}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            {L.finalCta.subtitle}
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-base px-8 shadow-lg">
              {L.finalCta.button} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm opacity-70 mt-4">
            {L.finalCta.footnote}
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
                <span className="font-bold">{t("brandName")}</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                {L.footer.tagline}
              </p>
            </div>
            <div>
              <p className="font-medium text-sm mb-3">{L.footer.product}</p>
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
              <p className="font-medium text-sm mb-3">{L.footer.legal}</p>
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
          <Separator className="mb-6" />
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {L.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
