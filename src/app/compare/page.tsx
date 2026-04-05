import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Zap, Globe, CreditCard } from "lucide-react";

export const metadata: Metadata = {
  title: "RepostAI vs Competitors — Best Content Repurposing Tool India 2025",
  description:
    "See how RepostAI compares to SocialPilot, Predis.ai, ContentStudio, Typefully and Repurpose.io. The only India-first repurposing tool with Hindi AI, UPI checkout, and 10 platforms.",
  openGraph: {
    title: "RepostAI vs Competitors — Best Content Repurposing Tool India 2025",
    description:
      "India's only content repurposing tool with Hinglish AI, UPI payment, and 10 platforms including Telegram and WhatsApp.",
  },
};

const COMPARISONS = [
  {
    slug: "socialpilot",
    name: "SocialPilot",
    tagline: "Indian scheduler, no real repurposing",
    verdict: "RepostAI wins",
    price: "₹1,700/mo",
    upi: false,
    hindi: false,
    repurpose: false,
    badge: "Most searched",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    slug: "predis-ai",
    name: "Predis.ai",
    tagline: "USD pricing, credit model, weak Hindi",
    verdict: "RepostAI wins",
    price: "$19+ USD/mo",
    upi: false,
    hindi: false,
    repurpose: false,
    badge: "Popular in India",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  {
    slug: "contentstudio",
    name: "ContentStudio",
    tagline: "Agency scheduler, no India focus",
    verdict: "RepostAI wins",
    price: "$19+ USD/mo",
    upi: false,
    hindi: false,
    repurpose: false,
    badge: null,
    badgeColor: "",
  },
  {
    slug: "typefully",
    name: "Typefully",
    tagline: "Only 4 platforms, no Instagram",
    verdict: "RepostAI wins",
    price: "$8+ USD/mo",
    upi: false,
    hindi: false,
    repurpose: false,
    badge: null,
    badgeColor: "",
  },
  {
    slug: "repurpose-io",
    name: "Repurpose.io",
    tagline: "Rule automation, zero AI generation",
    verdict: "RepostAI wins",
    price: "$29+ USD/mo",
    upi: false,
    hindi: false,
    repurpose: false,
    badge: null,
    badgeColor: "",
  },
];

const WHY_SWITCH = [
  {
    icon: Globe,
    title: "Hindi & Regional AI",
    description:
      "RepostAI generates Hinglish-aware content that sounds like a real Indian creator — not a machine translation. Supports Marathi, Bengali, Telugu, Kannada, Odia, Punjabi, and more.",
    stat: "9 Indian languages",
  },
  {
    icon: CreditCard,
    title: "UPI Checkout",
    description:
      "Pay with PhonePe, GPay, Paytm, or any UPI app. No need for a credit card. INR pricing with GST invoices included — built for how India pays.",
    stat: "₹499/mo starting",
  },
  {
    icon: Zap,
    title: "True Repurposing",
    description:
      "Paste a YouTube URL, a PDF, or a blog link — and get 10 platform-ready posts in seconds. Not a scheduler. Not captions. A full content repurposing engine.",
    stat: "10 platforms at once",
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Check className="size-4" />
            India-first comparison
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            How RepostAI compares to{" "}
            <span className="text-primary">every alternative</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Most content tools were built for Western creators. RepostAI was
            built for India — with Hinglish AI, UPI checkout, and platforms like
            WhatsApp and Telegram that Indian audiences actually use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Try RepostAI Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#comparisons">See all comparisons</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Comparison Cards */}
      <section
        id="comparisons"
        className="py-16 px-4 sm:px-6 bg-muted/30"
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            RepostAI vs the competition
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Three questions every Indian creator should ask before paying for
            any content tool.
          </p>

          {/* Feature legend */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="size-4 text-green-600" /> RepostAI has it
            </span>
            <span className="flex items-center gap-1.5">
              <X className="size-4 text-red-500" /> Competitor lacks it
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="compare-grid">
            {COMPARISONS.map((c) => (
              <div
                key={c.slug}
                className="bg-card border rounded-xl p-6 flex flex-col gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{c.name}</h3>
                      {c.badge && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badgeColor}`}
                        >
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {c.tagline}
                    </p>
                  </div>
                </div>

                {/* Feature comparison */}
                <div className="border rounded-lg overflow-hidden text-sm">
                  <div className="grid grid-cols-3 bg-muted/50 px-3 py-2 font-medium text-xs text-muted-foreground uppercase tracking-wide">
                    <span>Feature</span>
                    <span className="text-center text-green-700">RepostAI</span>
                    <span className="text-center">{c.name}</span>
                  </div>
                  {[
                    { label: "UPI pay", repostai: true, competitor: c.upi },
                    { label: "Hindi AI", repostai: true, competitor: c.hindi },
                    {
                      label: "Repurpose",
                      repostai: true,
                      competitor: c.repurpose,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-3 px-3 py-2.5 border-t items-center"
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="flex justify-center">
                        <Check className="size-4 text-green-600" />
                      </span>
                      <span className="flex justify-center">
                        {row.competitor ? (
                          <Check className="size-4 text-green-600" />
                        ) : (
                          <X className="size-4 text-red-500" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="text-sm text-muted-foreground">
                    Competitor:{" "}
                    <span className="font-medium text-foreground">
                      {c.price}
                    </span>
                  </div>
                  {c.slug === "socialpilot" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/compare/${c.slug}`}>
                        Full comparison
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full">
                      RepostAI wins
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* RepostAI summary card */}
            <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6 flex flex-col gap-4 sm:col-span-2 lg:col-span-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="size-5 text-primary" />
                    <h3 className="font-semibold text-lg">RepostAI</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      India-first
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Starts at{" "}
                    <span className="font-semibold text-foreground">
                      ₹499/mo
                    </span>{" "}
                    — Hindi AI, UPI, 10 platforms, true content repurposing.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {[
                    "UPI / GPay",
                    "Hindi AI",
                    "YouTube → posts",
                    "WhatsApp",
                    "Telegram",
                    "GST invoice",
                  ].map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium"
                    >
                      <Check className="size-3.5" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button asChild size="sm">
                  <Link href="/dashboard">
                    Start for free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/pricing">See pricing</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Indian Creators Are Switching */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Why Indian creators are switching to RepostAI
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three things no foreign tool gets right — and one Indian-built
              tool does.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {WHY_SWITCH.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col gap-4">
                  <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">
                      {item.stat}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stop comparing. Start repurposing.
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Free plan available. No credit card needed. Pay with UPI when you
            upgrade.
          </p>
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
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  );
}
