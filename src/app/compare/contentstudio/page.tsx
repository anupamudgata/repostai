import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  ArrowRight,
  Star,
  Zap,
  Globe,
  AlertTriangle,
  IndianRupee,
  Users,
  MessageCircle,
  Building2,
  TrendingUp,
  Languages,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";

export const metadata: Metadata = {
  title: "RepostAI vs ContentStudio: India-First Alternative with Hindi AI (2025)",
  description:
    "ContentStudio is built for Western agencies. RepostAI is built for Indian creators — Hindi AI, UPI payment, ₹499/mo, and 10 platforms including Telegram and WhatsApp.",
  openGraph: {
    title: "RepostAI vs ContentStudio: India-First Alternative with Hindi AI (2025)",
    description:
      "ContentStudio is built for Western agencies. RepostAI is built for Indian creators — Hindi AI, UPI payment, ₹499/mo, and 10 platforms including Telegram and WhatsApp.",
  },
};

const TABLE_ROWS = [
  {
    feature: "Starting price",
    repostai: "₹499/mo",
    competitor: "~₹1,888/mo (after GST+forex)",
    repostaiWin: true,
  },
  {
    feature: "Billing currency",
    repostai: "INR — no surprises",
    competitor: "USD + 18% GST + forex fees",
    repostaiWin: true,
  },
  {
    feature: "UPI / PhonePe / GPay",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "GST invoice",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "Free plan",
    repostai: "5 repurposes/mo, no card",
    competitor: "14-day trial only",
    repostaiWin: true,
  },
  {
    feature: "Real AI repurposing",
    repostai: "YouTube, PDF, Blog → posts",
    competitor: "Caption generation only",
    repostaiWin: true,
  },
  {
    feature: "YouTube URL → posts",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "PDF / Blog URL → posts",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "Hindi (Hinglish-aware AI)",
    repostai: "Native Hinglish tone",
    competitor: "Generic, no Indian tone",
    repostaiWin: true,
  },
  {
    feature: "8 Indian languages",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "WhatsApp Status",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "Telegram",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "Total platforms",
    repostai: "10 platforms",
    competitor: "~9 (no WhatsApp/Telegram)",
    repostaiWin: true,
  },
  {
    feature: "Brand voice training",
    repostai: true,
    competitor: "Basic",
    repostaiWin: true,
  },
  {
    feature: "Photo captions",
    repostai: true,
    competitor: true,
    repostaiWin: false,
  },
  {
    feature: "Scheduling",
    repostai: true,
    competitor: true,
    repostaiWin: false,
  },
  {
    feature: "Team approval workflows",
    repostai: "Not needed for solo creators",
    competitor: "Yes (agency feature)",
    repostaiWin: false,
  },
  {
    feature: "Content discovery (India)",
    repostai: "Coming soon",
    competitor: "US/UK trends only",
    repostaiWin: false,
  },
  {
    feature: "Built for solo Indian creators",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
];

const FAQS = [
  {
    q: "Is RepostAI cheaper than ContentStudio for Indian creators?",
    a: "Yes — considerably. RepostAI Starter is ₹499/mo billed in INR. ContentStudio's Standard plan starts at $19/mo, which after 18% GST and forex fees costs Indian users approximately ₹1,888–₹1,930/mo. That's nearly 4x the cost.",
  },
  {
    q: "Does ContentStudio do real content repurposing?",
    a: "No. ContentStudio generates captions and schedules posts — but you still have to write your own content. RepostAI takes a YouTube URL, PDF, or blog post and transforms it into ready-to-publish posts for 10 platforms. That's what actual repurposing looks like.",
  },
  {
    q: "Does RepostAI support WhatsApp and Telegram like ContentStudio doesn't?",
    a: "Yes. RepostAI supports WhatsApp Status and Telegram — India's two most-used messaging platforms. ContentStudio does not support either, which is a significant gap for Indian creators.",
  },
  {
    q: "Is ContentStudio good for Indian solopreneurs?",
    a: "ContentStudio is designed for Western digital marketing agencies with multi-client workflows, team approvals, and content discovery tuned to US/UK trends. Indian solopreneurs pay for a bloated feature set they never use — in USD, without GST invoices.",
  },
  {
    q: "Can I pay RepostAI with UPI?",
    a: "Yes. RepostAI uses Razorpay and accepts PhonePe, Google Pay, Paytm, and all UPI apps. ContentStudio requires an international credit card billed in USD.",
  },
  {
    q: "Does RepostAI support Hindi AI content?",
    a: "Yes. RepostAI is purpose-built for Indian creators with Hinglish-aware AI that understands how Hindi and English naturally mix in Indian social media. ContentStudio has generic multilingual support but no Indian creator tone.",
  },
];

function CheckCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex items-center justify-center">
        <Check className="h-5 w-5 text-emerald-500" aria-label="Yes" />
      </span>
    ) : (
      <span className="inline-flex items-center justify-center">
        <X className="h-5 w-5 text-red-400" aria-label="No" />
      </span>
    );
  }
  return <span className="text-sm">{value}</span>;
}

export default function ContentStudioComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2"
        >
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/compare"
                className="hover:text-foreground transition-colors"
              >
                Compare
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium">
              RepostAI vs ContentStudio
            </li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-6">
            <Star className="h-3.5 w-3.5" />
            Updated April 2025
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 max-w-3xl mx-auto">
            RepostAI vs ContentStudio: Stop Paying Agency Prices for Solo Creator Needs
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            ContentStudio is built for Western agencies. RepostAI is built for
            Indian creators — Hindi AI, UPI, ₹499/mo, WhatsApp, Telegram.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 text-base">
              <Link href="/signup">
                Try RepostAI Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#comparison-table">See Full Comparison</Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: IndianRupee, label: "Starting at", value: "₹499/mo" },
              { icon: Globe, label: "Platforms", value: "10" },
              { icon: Languages, label: "Indian languages", value: "8" },
              { icon: MessageCircle, label: "WhatsApp + Telegram", value: "Yes" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border bg-card p-4 text-center"
              >
                <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* The India Problem */}
        <section className="bg-amber-50 dark:bg-amber-950/20 border-y border-amber-200 dark:border-amber-900/40 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-3 py-1 text-sm font-medium text-amber-700 dark:text-amber-400 mb-4">
                <AlertTriangle className="h-3.5 w-3.5" />
                The India Problem with ContentStudio
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Built for Western agencies. Charged to Indian creators.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Building2,
                  title: "Designed for agencies",
                  body: "Team workflows, client approvals, content calendars — features a solo Indian creator will never touch, but pay for every month.",
                },
                {
                  icon: IndianRupee,
                  title: "USD billing",
                  body: "₹1,888–₹8,400/mo after 18% GST and forex fees. No UPI, no INR. No GST invoice your CA can use.",
                },
                {
                  icon: MessageCircle,
                  title: "No WhatsApp or Telegram",
                  body: "India's #1 and #2 messaging platforms are missing. ContentStudio is optimized for US/UK social — not how India communicates.",
                },
                {
                  icon: TrendingUp,
                  title: "Content trends for the West",
                  body: "Their content discovery shows trending topics in the US and UK. Indian coaches, founders, and creators get zero local signal.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-amber-950/10 p-5"
                >
                  <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400 mb-3" />
                  <h3 className="font-semibold text-sm mb-2">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section
          id="comparison-table"
          className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            Full Feature Comparison
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Every feature, side by side — no marketing fluff.
          </p>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold w-1/3">
                    Feature
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 w-1/3">
                    RepostAI
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-muted-foreground w-1/3">
                    ContentStudio
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b last:border-0 ${
                      i % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.feature}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={
                          row.repostaiWin
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        <CheckCell value={row.repostai} />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      <CheckCell value={row.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            ContentStudio data sourced from their public pricing page. INR
            estimates at ₹84/USD + 18% GST. Last updated April 2025.
          </p>
        </section>

        {/* What ContentStudio Doesn't Tell You */}
        <section className="bg-muted/40 border-y py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
              What ContentStudio Doesn&apos;t Tell You
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              Things the landing page glosses over.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  heading: "Their \"AI\" generates captions, not repurposed content",
                  body: "ContentStudio's AI writes caption ideas. You still bring your own video, article, or talk. RepostAI takes a YouTube link, PDF, or blog URL and turns it into 10 platform-ready posts — that's actual repurposing.",
                },
                {
                  heading: "Content discovery is for the US and UK",
                  body: "ContentStudio's trending topics and content inspiration are tuned to Western markets. Indian creators get content signals from the US — not Bharat.",
                },
                {
                  heading: "Team workflows you'll never use",
                  body: "Their platform is built for agencies managing 10+ client accounts with approval loops. As a solo creator or small team, you pay for all of it and use none of it.",
                },
                {
                  heading: "Their cheapest plan: ₹1,600+/mo for 1 workspace",
                  body: "The Standard plan at $19/mo gives you 1 workspace and 5 social accounts. After 18% GST and forex conversion, that's ₹1,888–₹1,930/mo — compared to RepostAI at ₹499/mo.",
                },
              ].map(({ heading, body }) => (
                <div
                  key={heading}
                  className="rounded-xl border bg-card p-6 flex gap-4"
                >
                  <div className="mt-0.5">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-1.5">
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2">{heading}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Should Use What */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            Who Should Use Which Tool
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Both are legitimate tools — but they serve very different people.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* ContentStudio */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-muted p-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-base">ContentStudio</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Best suited for:
              </p>
              <ul className="space-y-2">
                {[
                  "Large Western digital marketing agencies",
                  "Teams managing 10+ client accounts",
                  "Agencies with a $100+/mo tool budget",
                  "Operations needing approval workflows",
                  "Businesses primarily targeting US/UK markets",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* RepostAI */}
            <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-2">
                  <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-base text-emerald-700 dark:text-emerald-300">
                  RepostAI
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Built for:
              </p>
              <ul className="space-y-2">
                {[
                  "Indian coaches, founders, and solopreneurs",
                  "Content creators who want Hindi / Hinglish output",
                  "Anyone publishing to WhatsApp or Telegram",
                  "Teams that need GST invoices and UPI payments",
                  "Creators who want real repurposing — not caption generation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing comparison */}
        <section className="bg-muted/40 border-y py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
              Pricing Comparison
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              All prices in INR, including estimated taxes
            </p>

            <div className="space-y-4">
              {[
                {
                  label: "RepostAI Starter",
                  price: 499,
                  max: 4500,
                  color: "bg-emerald-500",
                  highlight: true,
                },
                {
                  label: "RepostAI Pro",
                  price: 999,
                  max: 4500,
                  color: "bg-emerald-400",
                  highlight: false,
                },
                {
                  label: "RepostAI Agency",
                  price: 2999,
                  max: 4500,
                  color: "bg-emerald-600",
                  highlight: false,
                },
                {
                  label: "ContentStudio Standard (~₹1,930/mo)",
                  price: 1930,
                  max: 4500,
                  color: "bg-red-400",
                  highlight: false,
                },
                {
                  label: "ContentStudio Advanced (~₹4,300/mo)",
                  price: 4300,
                  max: 4500,
                  color: "bg-red-600",
                  highlight: false,
                },
              ].map(({ label, price, max, color }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-60 shrink-0 text-sm font-medium text-right leading-snug">
                    {label}
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full flex items-center justify-end pr-3`}
                      style={{ width: `${Math.min((price / max) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        ₹{price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              ContentStudio Agency is $99/mo (~₹8,800+/mo after taxes). RepostAI
              pricing is in INR with no hidden conversions.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Honest answers, no spin.
          </p>

          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-700 dark:to-emerald-800 p-8 sm:p-12 text-white text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white mb-4">
              <Users className="h-3.5 w-3.5" />
              India-first. Hindi-first. Yours-first.
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Try the Content Tool Built for Indian Creators
            </h2>
            <p className="text-emerald-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              No agency bloat. No USD invoices. No missing WhatsApp or Telegram.
              Just ₹499/mo, UPI, and AI that writes the way India talks.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2 text-base font-semibold"
              >
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/pricing">View All Plans</Link>
              </Button>
            </div>
            <p className="text-emerald-200 text-sm mt-6">
              5 free repurposes/month · No credit card · Cancel anytime
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
