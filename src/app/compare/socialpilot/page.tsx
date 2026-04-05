import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  X,
  ChevronRight,
  Trophy,
  AlertTriangle,
  IndianRupee,
  Languages,
  Repeat2,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "RepostAI vs SocialPilot (2025): Better Hindi AI, UPI, True Repurposing",
  description:
    "SocialPilot alternative for Indian creators. RepostAI offers Hinglish-aware AI, UPI/GPay checkout, and true content repurposing from YouTube/PDF — at ₹499/mo vs ₹1,700/mo.",
  keywords: [
    "SocialPilot alternative India",
    "SocialPilot vs RepostAI",
    "SocialPilot Hindi",
    "best social media tool India 2025",
    "content repurposing tool India",
  ],
  openGraph: {
    title: "RepostAI vs SocialPilot — The Better Choice for Indian Creators",
    description:
      "Hinglish AI, UPI checkout, and YouTube → posts repurposing at ₹499/mo. SocialPilot charges ₹1,700/mo for scheduling alone.",
  },
};

const TABLE_ROWS: {
  feature: string;
  repostai: string | boolean;
  socialpilot: string | boolean;
  highlight?: boolean;
}[] = [
  {
    feature: "Starting price",
    repostai: "₹499/mo",
    socialpilot: "₹1,700/mo",
    highlight: true,
  },
  { feature: "INR billing", repostai: true, socialpilot: true },
  {
    feature: "UPI / PhonePe / GPay",
    repostai: true,
    socialpilot: false,
    highlight: true,
  },
  {
    feature: "GST invoice",
    repostai: true,
    socialpilot: false,
    highlight: true,
  },
  {
    feature: "Free plan",
    repostai: "5 repurposes/mo",
    socialpilot: "14-day trial only",
  },
  {
    feature: "Platforms",
    repostai: "10 incl. Telegram & WhatsApp",
    socialpilot: "10 excl. Telegram & WhatsApp",
    highlight: true,
  },
  {
    feature: "Hindi AI (Hinglish-aware)",
    repostai: true,
    socialpilot: false,
    highlight: true,
  },
  { feature: "8 regional languages", repostai: true, socialpilot: false },
  { feature: "YouTube → posts", repostai: true, socialpilot: false, highlight: true },
  { feature: "PDF → posts", repostai: true, socialpilot: false },
  { feature: "Blog URL → posts", repostai: true, socialpilot: false },
  { feature: "Photo → captions", repostai: true, socialpilot: false },
  { feature: "Brand voice training", repostai: true, socialpilot: "Basic" },
  { feature: "Telegram posting", repostai: true, socialpilot: false },
  { feature: "WhatsApp Status", repostai: true, socialpilot: false },
  {
    feature: "Trustpilot rating",
    repostai: "N/A (new)",
    socialpilot: "2.4/5 ⚠️",
  },
  {
    feature: "Support response",
    repostai: "Fast",
    socialpilot: "24–72 hrs (reported)",
  },
];

const REASONS = [
  {
    icon: Repeat2,
    number: "01",
    title: "It doesn't actually repurpose content",
    body: "SocialPilot helps you schedule content you've already created. It doesn't turn your YouTube video into a LinkedIn post, Instagram caption, and Telegram message. You still do all the writing, editing, and reformatting — SocialPilot just queues the post. RepostAI pastes a URL and generates 10 platform-ready posts in under 30 seconds.",
    repostaiLabel: "RepostAI: paste URL → 10 posts in seconds",
    socialpilotLabel: "SocialPilot: you write it, they schedule it",
  },
  {
    icon: Languages,
    number: "02",
    title: "The Hindi AI sounds like a textbook",
    body: "SocialPilot's AI generates generic captions. It doesn't know Hinglish, doesn't understand Indian creator tone, and doesn't write the way your audience actually talks. Output like \"Aaj ke din, hum aapko kuch vishesh batana chahte hain\" kills engagement. RepostAI is trained on Indian creator content — it writes \"यार सुनो\", \"Aaj main share karna chahta hoon\", and code-switches naturally between Hindi and English.",
    repostaiLabel: "RepostAI: Hinglish-aware, culturally tuned",
    socialpilotLabel: "SocialPilot: stiff, generic Hindi output",
  },
  {
    icon: IndianRupee,
    number: "03",
    title: "₹1,700/mo for a scheduler? And no UPI?",
    body: "SocialPilot charges 3.4x more than RepostAI's Starter plan — and for a tool that doesn't repurpose anything. On top of that, they don't accept UPI. For Indian creators who run everything on PhonePe or GPay, having to dig out a credit card is a dealbreaker. RepostAI is ₹499/mo, accepts UPI, and includes a GST invoice.",
    repostaiLabel: "₹499/mo — UPI, GPay, GST invoice included",
    socialpilotLabel: "₹1,700/mo — credit card only, no GST confirmed",
  },
];

const PRICING = [
  {
    name: "RepostAI Free",
    price: "₹0",
    period: "forever",
    features: ["5 repurposes/month", "All 10 platforms", "Hindi AI included"],
    cta: "Start free",
    href: "/dashboard",
    highlight: false,
    brand: true,
  },
  {
    name: "RepostAI Starter",
    price: "₹499",
    period: "/month",
    features: [
      "Unlimited repurposes",
      "10 platforms incl. Telegram & WhatsApp",
      "Hindi + 8 regional languages",
      "YouTube, PDF, Blog repurposing",
      "UPI / GPay checkout",
      "GST invoice",
    ],
    cta: "Get Starter",
    href: "/pricing",
    highlight: true,
    brand: true,
  },
  {
    name: "RepostAI Pro",
    price: "₹999",
    period: "/month",
    features: [
      "Everything in Starter",
      "Brand voice training",
      "Advanced AI models",
      "Priority support",
    ],
    cta: "Get Pro",
    href: "/pricing",
    highlight: false,
    brand: true,
  },
  {
    name: "SocialPilot Standard",
    price: "₹1,700",
    period: "/month",
    features: [
      "Scheduling only",
      "No true repurposing",
      "No Hinglish AI",
      "No UPI payment",
      "No Telegram / WhatsApp",
      "2.4/5 Trustpilot",
    ],
    cta: "Not recommended",
    href: "#",
    highlight: false,
    brand: false,
  },
];

const FAQ = [
  {
    q: "Is RepostAI cheaper than SocialPilot?",
    a: "Yes. RepostAI Starter is ₹499/mo versus SocialPilot Standard at ₹1,700/mo. That's a saving of ₹14,400 per year — for a tool that does significantly more.",
  },
  {
    q: "Does RepostAI support Hindi content generation?",
    a: "Yes. RepostAI has Hinglish-aware AI that writes the way Indian creators actually talk — mixing Hindi and English naturally. It also supports Marathi, Bengali, Telugu, Kannada, Odia, Punjabi, Spanish, Portuguese, and French.",
  },
  {
    q: "Can I pay for RepostAI with UPI?",
    a: "Yes. RepostAI accepts UPI, PhonePe, GPay, Paytm, and all major UPI apps via Razorpay. GST invoices are included automatically.",
  },
  {
    q: "Does SocialPilot repurpose content?",
    a: "No. SocialPilot is a social media scheduling tool. It helps you publish and queue posts you've already written. It does not turn a YouTube video, PDF, or blog post into platform-optimised social content the way RepostAI does.",
  },
  {
    q: "Does SocialPilot support Telegram or WhatsApp?",
    a: "No. SocialPilot does not post to Telegram or WhatsApp Status. RepostAI supports both, along with LinkedIn, Twitter/X, Instagram, Facebook, Reddit, Email, and TikTok.",
  },
  {
    q: "Is there a free plan on RepostAI?",
    a: "Yes. RepostAI has a permanent free tier with 5 repurposes per month — no credit card required. You only need to pay when you need more capacity.",
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <span className="flex justify-center">
        <Check className="size-5 text-green-600" aria-label="Yes" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="flex justify-center">
        <X className="size-5 text-red-500" aria-label="No" />
      </span>
    );
  }
  return <span className="text-sm text-center block">{value}</span>;
}

export default function SocialPilotComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-2"
      >
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link
              href="/compare"
              className="hover:text-foreground transition-colors"
            >
              Compare
            </Link>
          </li>
          <li>
            <ChevronRight className="size-3.5" />
          </li>
          <li className="text-foreground font-medium">vs SocialPilot</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="pt-6 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-200">
            <Trophy className="size-4" />
            RepostAI recommended for Indian creators
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
            RepostAI vs SocialPilot:{" "}
            <span className="text-primary">
              The Better Choice for Indian Creators
            </span>{" "}
            (2025)
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            SocialPilot is a scheduling tool. RepostAI is a repurposing engine.
            Here&apos;s why 1,000+ Indian creators are switching.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Try RepostAI free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#comparison-table">
                See full comparison ↓
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Verdict */}
      <section className="py-12 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-8">
            Quick verdict — 3 things that matter most
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Price card */}
            <div className="bg-card border rounded-xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Price
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-2xl font-bold text-green-600">
                  ₹499
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">
                  /mo RepostAI
                </span>
              </div>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-bold text-red-500">
                  ₹1,700
                </span>
                <span className="text-sm text-muted-foreground mb-0.5">
                  /mo SocialPilot
                </span>
              </div>
              <div className="text-sm text-green-700 font-medium bg-green-50 rounded-lg px-3 py-2">
                Save ₹14,400/year with RepostAI
              </div>
            </div>

            {/* Hindi AI card */}
            <div className="bg-card border rounded-xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Hindi AI
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-green-600 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-medium">RepostAI:</span> Hinglish-aware,
                    culturally tuned to Indian creators
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <X className="size-4 text-red-500 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-medium">SocialPilot:</span> Generic
                    English AI that outputs stiff, formal Hindi
                  </span>
                </div>
              </div>
              <div className="text-sm text-green-700 font-medium bg-green-50 rounded-lg px-3 py-2">
                9 Indian languages supported
              </div>
            </div>

            {/* Repurposing card */}
            <div className="bg-card border rounded-xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                True Repurposing
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-green-600 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-medium">RepostAI:</span> Paste YouTube
                    URL → 10 posts in Hindi across all platforms
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <X className="size-4 text-red-500 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-medium">SocialPilot:</span> Schedule
                    posts you already wrote — no generation
                  </span>
                </div>
              </div>
              <div className="text-sm text-green-700 font-medium bg-green-50 rounded-lg px-3 py-2">
                YouTube, PDF, Blog → 10 platform posts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Comparison Table */}
      <section id="comparison-table" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Full feature comparison
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Every feature that matters for Indian creators, side by side.
          </p>

          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 bg-muted/50 font-semibold text-muted-foreground w-1/2">
                    Feature
                  </th>
                  <th className="px-4 py-3 bg-green-50 font-semibold text-green-800 w-1/4 text-center">
                    RepostAI
                  </th>
                  <th className="px-4 py-3 bg-muted/30 font-semibold text-muted-foreground w-1/4 text-center">
                    SocialPilot
                  </th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={[
                      i % 2 === 0 ? "bg-background" : "bg-muted/20",
                      row.highlight ? "font-medium" : "",
                      "border-t",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 text-foreground">{row.feature}</td>
                    <td className="px-4 py-3 bg-green-50/40 text-center">
                      <CellValue value={row.repostai} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <CellValue value={row.socialpilot} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Data based on public pricing and feature pages as of April 2025.
          </p>
        </div>
      </section>

      {/* 3 Reasons */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full mb-4">
              <AlertTriangle className="size-4" />
              Common complaints about SocialPilot
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              The 3 reasons Indian creators leave SocialPilot
            </h2>
          </div>

          <div className="grid gap-6">
            {REASONS.map((reason) => {
              const Icon = reason.icon;
              return (
                <div
                  key={reason.number}
                  className="bg-card border rounded-xl p-6 sm:p-8"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                        Reason {reason.number}
                      </div>
                      <h3 className="text-lg font-semibold mb-3">
                        &ldquo;{reason.title}&rdquo;
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-5">
                        {reason.body}
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2.5 bg-green-50 rounded-lg px-3 py-2.5">
                          <Check className="size-4 text-green-600 mt-0.5 shrink-0" />
                          <span className="text-green-800">
                            {reason.repostaiLabel}
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5 bg-red-50 rounded-lg px-3 py-2.5">
                          <X className="size-4 text-red-500 mt-0.5 shrink-0" />
                          <span className="text-red-800">
                            {reason.socialpilotLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Pricing comparison
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            All prices in INR. RepostAI accepts UPI, GPay, Paytm, and cards.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={[
                  "rounded-xl border p-6 flex flex-col gap-4",
                  plan.highlight
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "bg-card",
                  !plan.brand ? "opacity-80" : "",
                ].join(" ")}
              >
                <div>
                  {plan.highlight && (
                    <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block mb-2">
                      Most popular
                    </div>
                  )}
                  <div className="font-semibold text-sm text-muted-foreground">
                    {plan.name}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      {plan.brand ? (
                        <Check className="size-4 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <X className="size-4 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={
                          plan.brand ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.brand ? (
                  <Button
                    asChild
                    size="sm"
                    variant={plan.highlight ? "default" : "outline"}
                    className="w-full"
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                ) : (
                  <div className="text-xs text-center text-muted-foreground py-2">
                    {plan.cta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold mb-2">{item.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stop scheduling. Start repurposing.
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Free plan — no credit card needed. Pay with UPI when you upgrade.
            Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="font-semibold"
            >
              <Link href="/dashboard">
                Try RepostAI free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/60 mt-6">
            ₹499/mo vs ₹1,700/mo. You do the math.
          </p>
        </div>
      </section>

      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />

      <div className="h-16" />
    </div>
  );
}
