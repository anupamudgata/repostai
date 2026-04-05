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
  CreditCard,
  MessageCircle,
  Languages,
  Infinity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/landing-nav";

export const metadata: Metadata = {
  title: "RepostAI vs Predis.ai: Better Hindi AI, No Credits, INR Pricing (2025)",
  description:
    "Predis.ai charges in USD, runs out of credits, and has weak Hindi AI. RepostAI is ₹499/mo with UPI, unlimited repurposing, and real Hinglish-aware AI for Indian creators.",
  openGraph: {
    title: "RepostAI vs Predis.ai: Better Hindi AI, No Credits, INR Pricing (2025)",
    description:
      "Predis.ai charges in USD, runs out of credits, and has weak Hindi AI. RepostAI is ₹499/mo with UPI, unlimited repurposing, and real Hinglish-aware AI for Indian creators.",
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
    feature: "Credits / usage limits",
    repostai: "Unlimited — no credits",
    competitor: "1,300–3,200 credits, runs out",
    repostaiWin: true,
  },
  {
    feature: "Free plan",
    repostai: "5 repurposes/mo, no card",
    competitor: "Limited credits only",
    repostaiWin: true,
  },
  {
    feature: "Text repurposing",
    repostai: true,
    competitor: false,
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
    competitor: "Generic translation only",
    repostaiWin: true,
  },
  {
    feature: "8 Indian languages",
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
    feature: "WhatsApp Status",
    repostai: true,
    competitor: false,
    repostaiWin: true,
  },
  {
    feature: "Total platforms",
    repostai: "10 platforms",
    competitor: "Fewer Indian platforms",
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
    feature: "Image / video generation",
    repostai: "Coming soon",
    competitor: "Yes (Predis strength)",
    repostaiWin: false,
  },
  {
    feature: "Scheduling",
    repostai: true,
    competitor: true,
    repostaiWin: false,
  },
];

const FAQS = [
  {
    q: "Is RepostAI cheaper than Predis.ai?",
    a: "Yes — significantly. RepostAI Starter is ₹499/mo billed in INR. Predis.ai's Core plan starts at $19/mo, which after 18% GST and forex conversion costs Indian users ₹1,888–₹1,930/mo. That's nearly 4x the price.",
  },
  {
    q: "Does RepostAI have unlimited repurposing?",
    a: "Yes. RepostAI does not use a credit system. On paid plans you get generous monthly repurpose limits with no mid-month surprises. No credits, no anxiety.",
  },
  {
    q: "Does RepostAI support Hindi better than Predis.ai?",
    a: "Yes. RepostAI uses a purpose-built Hinglish-aware AI trained on how Indian creators actually write — mixing Hindi and English naturally. Predis.ai claims 19+ languages but the output reads like a direct translation, not like a real Hindi creator.",
  },
  {
    q: "Can I pay RepostAI with UPI instead of a USD card?",
    a: "Yes. RepostAI uses Razorpay and accepts PhonePe, Google Pay, Paytm, and all major UPI apps. Predis.ai requires an international credit card billed in USD.",
  },
  {
    q: "Does RepostAI generate images like Predis.ai?",
    a: "Not yet — image and video generation is on the roadmap. RepostAI is purpose-built for text repurposing: YouTube videos, PDFs, blog posts, and direct text → 10 platform formats. If visual AI is your only need, Predis.ai has an edge there.",
  },
];

function CheckCell({ value, label }: { value: boolean | string; label?: string }) {
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

export default function PredisAIComparePage() {
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
              RepostAI vs Predis.ai
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
            RepostAI vs Predis.ai: Why Indian Creators Are Done With Credits
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Predis.ai is built for global teams. RepostAI is built for India —
            in Hindi, in ₹, on UPI.
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
              { icon: Infinity, label: "Credits used", value: "Unlimited" },
              { icon: Globe, label: "Platforms", value: "10" },
              { icon: Languages, label: "Indian languages", value: "8" },
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

        {/* The Credit Problem */}
        <section className="bg-red-50 dark:bg-red-950/20 border-y border-red-200 dark:border-red-900/40 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-400 mb-4">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Predis.ai&apos;s #1 Complaint
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  The Credit Problem
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Predis.ai gives you{" "}
                  <strong>1,300 credits on their Core plan</strong>. Heavy users
                  — coaches, agencies, daily creators — run out in 2 weeks.
                  Then what? Pay again, or wait until next month staring at a
                  locked dashboard.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every post you generate, every variation, every caption — it
                  all costs credits. What was pitched as &quot;unlimited
                  creativity&quot; becomes a resource you ration.
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-5">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">
                    <X className="h-4 w-4" /> Predis.ai
                  </p>
                  <p className="text-sm text-muted-foreground">
                    1,300 credits on Core. Runs out mid-month. Upgrade or wait.
                    USD billing. No UPI. Hindi sounds like Google Translate.
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 p-5">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-2">
                    <Check className="h-4 w-4" /> RepostAI
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Unlimited repurposing. No credits. No anxiety. No
                    mid-month surprises. ₹499/mo on UPI. Real Hinglish AI.
                  </p>
                </div>
              </div>
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
                    Predis.ai
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
            Predis.ai data sourced from their public pricing page. Prices
            include estimated INR conversion at ₹84/USD + 18% GST. Last
            updated April 2025.
          </p>
        </section>

        {/* Real Cost Calculator */}
        <section className="bg-muted/40 border-y py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
              The Real Cost of Predis.ai in India
            </h2>
            <p className="text-muted-foreground text-center mb-10">
              What that $19/mo actually costs you
            </p>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              {/* Predis breakdown */}
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Predis.ai Core Plan — Monthly Cost
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      Base price ($19 × ₹84)
                    </span>
                    <span>₹1,596</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      + 18% GST on foreign services
                    </span>
                    <span>₹287</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">
                      + ~2.5% forex conversion fee
                    </span>
                    <span>₹47</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold text-red-600 dark:text-red-400">
                    <span>Total per month</span>
                    <span>~₹1,930</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold text-red-600 dark:text-red-400">
                    <span>Total per year</span>
                    <span>~₹23,160</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  And GST is not claimable — it&apos;s just gone.
                </p>
              </div>

              {/* RepostAI breakdown */}
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/20 p-6">
                <h3 className="font-semibold text-base mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <Zap className="h-4 w-4" />
                  RepostAI Starter Plan — Monthly Cost
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-emerald-200 dark:border-emerald-900/30">
                    <span className="text-muted-foreground">
                      Base price (INR, direct)
                    </span>
                    <span className="font-medium">₹499</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-200 dark:border-emerald-900/30">
                    <span className="text-muted-foreground">
                      GST surcharge
                    </span>
                    <span className="font-medium">₹0 extra</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-emerald-200 dark:border-emerald-900/30">
                    <span className="text-muted-foreground">
                      Forex conversion fee
                    </span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>Total per month</span>
                    <span>₹499</span>
                  </div>
                  <div className="flex justify-between py-2 font-semibold text-emerald-700 dark:text-emerald-400">
                    <span>Total per year</span>
                    <span>₹5,988</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-3">
                  GST invoice included. Claimable if you&apos;re a registered business.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-6 text-center">
              <p className="text-muted-foreground text-sm mb-1">
                You save every year by choosing RepostAI
              </p>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹17,172
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                (₹23,160 − ₹5,988 = ₹17,172/year)
              </p>
            </div>
          </div>
        </section>

        {/* 3 Reasons to Switch */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            3 Reasons Indian Creators Switch to RepostAI
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Not opinions — patterns we hear every week.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Credits are a scam for daily creators",
                body: "If you create content every day — repurposing clips, writing posts, testing variations — you will exhaust Predis.ai's credits before the month ends. RepostAI has no credit system. Generate as much as you need.",
                icon: AlertTriangle,
                color: "text-red-500",
              },
              {
                number: "02",
                title: "Your CA can't claim GST on a USD invoice",
                body: "A Predis.ai invoice in USD doesn't have a GSTIN. Indian business owners cannot claim input GST credit on it. RepostAI issues proper GST invoices — every month, automatically.",
                icon: IndianRupee,
                color: "text-amber-500",
              },
              {
                number: "03",
                title: "Hindi that sounds like a human",
                body: "Predis.ai's Hindi output sounds like a dictionary ran through Google Translate. RepostAI's Hinglish AI writes the way Indian creators actually talk — mixing Hindi and English naturally, with the right tone for each platform.",
                icon: MessageCircle,
                color: "text-emerald-500",
              },
            ].map(({ number, title, body, icon: Icon, color }) => (
              <div
                key={number}
                className="rounded-xl border bg-card p-6 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl font-black text-muted-foreground/20">
                    {number}
                  </span>
                  <Icon className={`h-5 w-5 ${color} mt-1`} />
                </div>
                <h3 className="font-semibold text-base leading-snug">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Visual */}
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
                  max: 2000,
                  color: "bg-emerald-500",
                  highlight: true,
                },
                {
                  label: "RepostAI Pro",
                  price: 999,
                  max: 2000,
                  color: "bg-emerald-400",
                  highlight: false,
                },
                {
                  label: "Predis.ai Core (~₹1,930 after tax)",
                  price: 1930,
                  max: 2000,
                  color: "bg-red-400",
                  highlight: false,
                },
                {
                  label: "Predis.ai Rise (~₹4,000+ after tax)",
                  price: 2000,
                  max: 2000,
                  color: "bg-red-600",
                  highlight: false,
                },
              ].map(({ label, price, max, color, highlight }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-52 shrink-0 text-sm font-medium text-right">
                    {label}
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden relative">
                    <div
                      className={`h-full ${color} rounded-full flex items-center justify-end pr-3 transition-all`}
                      style={{ width: `${Math.min((price / max) * 100, 100)}%` }}
                    >
                      <span className="text-xs font-bold text-white whitespace-nowrap">
                        ₹{price.toLocaleString("en-IN")}
                        {price >= max ? "+" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-6 text-center">
              RepostAI Agency is ₹2,999/mo. Predis.ai Enterprise is $212/mo
              (~₹19,000+/mo after taxes).
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Switch to RepostAI — No Credits, No USD, No Compromise
            </h2>
            <p className="text-emerald-100 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              Start free today. No credit card required. Upgrade when you&apos;re
              ready — with UPI, in ₹, on your terms.
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
                <Link href="/pricing">View Pricing</Link>
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
