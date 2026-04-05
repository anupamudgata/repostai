import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  ArrowRight,
  AlertCircle,
  Globe,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "RepostAI vs Typefully: 10 Platforms vs 4, Hindi AI, ₹499/mo (2025)",
  description:
    "Typefully only supports 4 platforms and has no Instagram or Hindi. RepostAI supports 10 platforms including Instagram, WhatsApp, Telegram with Hinglish AI at ₹499/mo.",
  openGraph: {
    title: "RepostAI vs Typefully: 10 Platforms vs 4, Hindi AI, ₹499/mo (2025)",
    description:
      "Typefully only supports 4 platforms and has no Instagram or Hindi. RepostAI supports 10 platforms including Instagram, WhatsApp, Telegram with Hinglish AI at ₹499/mo.",
  },
};

const TABLE_ROWS = [
  { feature: "Starting price", repostai: "₹499/mo", typefully: "~₹670/mo (USD)", repostaiWins: true },
  { feature: "INR billing", repostai: true, typefully: false },
  { feature: "UPI / PhonePe", repostai: true, typefully: false },
  { feature: "GST invoice", repostai: true, typefully: false },
  { feature: "Instagram", repostai: true, typefully: false },
  { feature: "Facebook", repostai: true, typefully: false },
  { feature: "TikTok", repostai: true, typefully: false },
  { feature: "WhatsApp Status", repostai: true, typefully: false },
  { feature: "Telegram", repostai: true, typefully: false },
  { feature: "YouTube repurposing", repostai: true, typefully: false },
  { feature: "Twitter/X", repostai: true, typefully: true },
  { feature: "LinkedIn", repostai: true, typefully: true },
  { feature: "Bluesky", repostai: false, typefully: true },
  { feature: "Hindi (Hinglish-aware)", repostai: true, typefully: false },
  { feature: "8 Indian languages", repostai: true, typefully: false },
  { feature: "AI repurposing", repostai: true, typefully: false },
  { feature: "YouTube → posts", repostai: true, typefully: false },
  { feature: "PDF → posts", repostai: true, typefully: false },
  { feature: "Photo → captions", repostai: true, typefully: false },
  { feature: "Brand voice training", repostai: true, typefully: false },
  { feature: "Free plan (usable)", repostai: "5 repurposes/mo", typefully: "1 scheduled post", repostaiWins: true },
];

const PRICING_ROWS = [
  {
    plan: "Entry",
    repostai: "₹499/mo",
    repostaiDetail: "10 platforms, Hindi AI, YouTube repurposing, photo captions, brand voice",
    typefully: "~₹670/mo (Starter)",
    typefullyDetail: "Twitter + LinkedIn scheduling only — no AI writing included",
    savings: "Save ₹170+",
  },
  {
    plan: "Mid",
    repostai: "₹999/mo",
    repostaiDetail: "Pro plan — unlimited repurposes, all platforms, priority AI",
    typefully: "~₹1,600/mo (Creator)",
    typefullyDetail: "First plan with AI writing — still only 4 platforms",
    savings: "Save ₹600+",
  },
  {
    plan: "Scale",
    repostai: "₹2,999/mo",
    repostaiDetail: "Agency — team seats, client workspaces, all features",
    typefully: "~₹3,300/mo (Team)",
    typefullyDetail: "Team collaboration on 4 platforms, no Hindi, no Instagram",
    savings: "Save ₹300+",
  },
];

const FAQS = [
  {
    q: "Does Typefully support Instagram?",
    a: "No. Typefully only supports Twitter/X, LinkedIn, Bluesky, and Mastodon. It has no Instagram integration at all. If Instagram is part of your content strategy — which it is for the majority of Indian creators — Typefully is not a viable option.",
  },
  {
    q: "Does Typefully have Hindi AI or regional language support?",
    a: "No. Typefully is an English-only tool built for Western Twitter and newsletter writers. It has no Hinglish awareness, no regional Indian language support, and no context for how Indian audiences communicate on social media.",
  },
  {
    q: "Does Typefully support Indian payment methods?",
    a: "No. Typefully bills in USD using international credit cards only. There is no UPI, no PhonePe, no GPay, and no Paytm support. You also do not get a GST invoice for your business.",
  },
  {
    q: "What is the best Typefully alternative for Indian creators?",
    a: "RepostAI. It supports 10 platforms including Instagram, WhatsApp, and Telegram, generates Hinglish-aware content in 8 Indian languages, starts at ₹499/mo with UPI checkout, and actually repurposes content — not just schedules threads.",
  },
  {
    q: "Is Typefully's free plan actually usable?",
    a: "Barely. The free plan limits you to 1 scheduled post total — not per day, 1 post ever. In practice, the free plan is a signup incentive, not a working free tier. RepostAI's free plan gives you 5 full repurposes per month with no credit card required.",
  },
];

const ALSO_COMPARE = [
  { slug: "socialpilot", name: "SocialPilot" },
  { slug: "predis-ai", name: "Predis.ai" },
  { slug: "contentstudio", name: "ContentStudio" },
  { slug: "repurpose-io", name: "Repurpose.io" },
];

function BoolCell({ value, label }: { value: boolean | string; label?: string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground font-medium">{value}</span>;
  }
  return value ? (
    <Check className="size-5 text-green-600 mx-auto" aria-label="Yes" />
  ) : (
    <X className="size-5 text-red-500 mx-auto" aria-label="No" />
  );
}

export default function TypefullyComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Breadcrumb */}
      <div className="pt-20 pb-0 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="size-3.5" />
            <Link href="/compare" className="hover:text-foreground transition-colors">Compare</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-foreground font-medium">vs Typefully</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-10 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-200">
            <AlertCircle className="size-4" />
            Typefully has NO Instagram
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            RepostAI vs Typefully: If You&apos;re an Indian Creator,{" "}
            <span className="text-primary">This Isn&apos;t Even a Contest</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Typefully is a Twitter thread tool. RepostAI repurposes your content to{" "}
            <strong className="text-foreground">10 platforms</strong> — including Instagram,
            WhatsApp, and Telegram — in Hindi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Try RepostAI Free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#comparison-table">See full comparison</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Brutal Truth Card */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="size-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900 mb-3">The brutal truth about Typefully</h2>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Typefully supports <strong>4 platforms only</strong>: Twitter/X, LinkedIn, Bluesky, Mastodon.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>It has <strong>NO Instagram</strong>. NO WhatsApp. NO Telegram. NO TikTok.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>It has <strong>NO Hindi AI</strong> — English-only tool built for Western users.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>It does <strong>not repurpose content</strong> — it&apos;s a Twitter/LinkedIn thread writer.</span>
                  </li>
                </ul>
                <p className="mt-4 text-red-700 font-semibold text-sm">
                  90% of Indian creators live on Instagram. Typefully wasn&apos;t built for you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Comparison Table */}
      <section id="comparison-table" className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Feature-by-feature comparison</h2>
            <p className="text-muted-foreground">Every feature that matters for Indian content creators</p>
          </div>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-4 font-semibold text-muted-foreground w-1/2">Feature</th>
                  <th className="text-center px-5 py-4 font-semibold w-1/4">
                    <span className="inline-flex items-center gap-1.5 text-green-700">
                      <Check className="size-4" />
                      RepostAI
                    </span>
                  </th>
                  <th className="text-center px-5 py-4 font-semibold text-muted-foreground w-1/4">Typefully</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center">
                      <BoolCell value={row.repostai} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <BoolCell value={row.typefully} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Who Typefully is actually for */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Who Typefully is actually for</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Check className="size-5 text-green-600 flex-shrink-0" />
                <h3 className="font-semibold text-green-900">Typefully is great for:</h3>
              </div>
              <ul className="space-y-2.5 text-green-800 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Western Twitter/X and LinkedIn power users writing long-form threads in English</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Newsletter writers who primarily distribute on Twitter and LinkedIn</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Creators on Bluesky or Mastodon looking for a dedicated thread composer</span>
                </li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <X className="size-5 text-red-600 flex-shrink-0" />
                <h3 className="font-semibold text-red-900">Typefully is NOT for:</h3>
              </div>
              <ul className="space-y-2.5 text-red-800 text-sm">
                <li className="flex items-start gap-2">
                  <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Indian creators who need Instagram — Typefully has zero Instagram support</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Creators who communicate in Hindi, Hinglish, or any regional Indian language</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Anyone needing WhatsApp Status or Telegram channel posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Creators who want to pay with UPI — Typefully is USD card only</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What ₹670/mo gets you */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">What ₹670/mo actually gets you</h2>
          <p className="text-muted-foreground text-center mb-10">
            Typefully Starter vs RepostAI Starter — a side-by-side reality check
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Typefully Starter */}
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Typefully Starter</h3>
                  <p className="text-muted-foreground text-sm">~₹670/mo (billed in USD)</p>
                </div>
                <span className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full font-medium">4 platforms</span>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  { ok: true, text: "Twitter/X scheduling" },
                  { ok: true, text: "LinkedIn scheduling" },
                  { ok: false, text: "No AI writing (requires Creator at $19/mo)" },
                  { ok: false, text: "No Instagram" },
                  { ok: false, text: "No WhatsApp or Telegram" },
                  { ok: false, text: "No Hindi or Indian language support" },
                  { ok: false, text: "No YouTube or blog repurposing" },
                  { ok: false, text: "Billed in USD — no UPI, no GST invoice" },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-2">
                    {item.ok ? (
                      <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="size-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RepostAI Starter */}
            <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">RepostAI Starter</h3>
                  <p className="text-primary font-semibold text-sm">₹499/mo — pay with UPI</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">10 platforms</span>
              </div>
              <ul className="space-y-2.5 text-sm">
                {[
                  "Instagram, WhatsApp Status, Telegram",
                  "Twitter/X, LinkedIn, Facebook, TikTok",
                  "Hindi AI — Hinglish-aware generation",
                  "8 Indian regional languages",
                  "YouTube URL → platform-native posts",
                  "PDF & blog → social posts",
                  "Photo → AI captions",
                  "Brand voice training",
                  "UPI checkout — PhonePe, GPay, Paytm",
                  "GST invoice included",
                ].map((text) => (
                  <li key={text} className="flex items-start gap-2">
                    <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">Pricing comparison</h2>
          <p className="text-muted-foreground text-center mb-10">
            RepostAI is cheaper at every tier — and gives you more at each level
          </p>
          <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Tier</th>
                  <th className="text-left px-5 py-4 font-semibold text-green-700">RepostAI</th>
                  <th className="text-left px-5 py-4 font-semibold text-muted-foreground">Typefully</th>
                  <th className="text-center px-5 py-4 font-semibold text-primary">Savings</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_ROWS.map((row, i) => (
                  <tr key={row.plan} className={`border-b last:border-0 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="px-5 py-4 font-medium">{row.plan}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-green-700">{row.repostai}</div>
                      <div className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{row.repostaiDetail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-muted-foreground">{row.typefully}</div>
                      <div className="text-muted-foreground text-xs mt-0.5 leading-relaxed">{row.typefullyDetail}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        {row.savings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Typefully prices converted at approximate ₹84/USD rate. Actual INR cost varies with exchange rate and bank fees.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-card border rounded-xl p-6">
                <h3 className="font-semibold text-base mb-2 flex items-start gap-2">
                  <Globe className="size-4 text-primary mt-0.5 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Also compare */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">Also compare RepostAI vs:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {ALSO_COMPARE.map((item) => (
              <Link
                key={item.slug}
                href={`/compare/${item.slug}`}
                className="text-sm font-medium text-primary hover:underline underline-offset-4 bg-primary/5 px-4 py-2 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors"
              >
                RepostAI vs {item.name}
              </Link>
            ))}
            <Link
              href="/compare"
              className="text-sm font-medium text-muted-foreground hover:text-foreground bg-muted px-4 py-2 rounded-full border transition-colors"
            >
              All comparisons →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Your audience is on Instagram.{" "}
            <br className="hidden sm:block" />
            Your tool should be too.
          </h2>
          <p className="text-primary-foreground/80 mb-3 text-lg">
            RepostAI supports 10 platforms, generates Hindi content, and starts at ₹499/mo with UPI checkout.
          </p>
          <p className="text-primary-foreground/60 mb-8 text-sm">
            Free plan available. No credit card needed. 5 repurposes/month on us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" variant="secondary" className="font-semibold">
              <Link href="/auth/signup">
                Start free — no card needed
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="h-16" />
    </div>
  );
}
