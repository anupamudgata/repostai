import type { Metadata } from "next";
import Link from "next/link";
import { LandingNav } from "@/components/landing-nav";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  ArrowRight,
  AlertCircle,
  Zap,
  Globe,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "RepostAI vs Repurpose.io: AI-Powered vs Rule-Based Repurposing (2025)",
  description:
    "Repurpose.io uses automation rules with zero AI generation. RepostAI uses AI to write platform-native posts in Hindi and 9 other languages at ₹499/mo with UPI.",
  openGraph: {
    title: "RepostAI vs Repurpose.io: AI-Powered vs Rule-Based Repurposing (2025)",
    description:
      "Repurpose.io uses automation rules with zero AI generation. RepostAI uses AI to write platform-native posts in Hindi and 9 other languages at ₹499/mo with UPI.",
  },
};

const TABLE_ROWS = [
  { feature: "Starting price", repostai: "₹499/mo", repurposeio: "~₹2,450/mo", repostaiWins: true },
  { feature: "INR billing", repostai: true, repurposeio: false },
  { feature: "UPI checkout", repostai: true, repurposeio: false },
  { feature: "GST invoice", repostai: true, repurposeio: false },
  { feature: "AI writes captions", repostai: true, repurposeio: false },
  { feature: "YouTube URL → posts", repostai: "AI-written", repurposeio: "reposts video only", repostaiWins: true },
  { feature: "Blog URL → social posts", repostai: true, repurposeio: false },
  { feature: "Text input → posts", repostai: true, repurposeio: false },
  { feature: "PDF → posts", repostai: true, repurposeio: false },
  { feature: "Platform-native format", repostai: "each platform different", repurposeio: "same content everywhere", repostaiWins: true },
  { feature: "Hindi AI", repostai: true, repurposeio: false },
  { feature: "8 Indian languages", repostai: true, repurposeio: false },
  { feature: "LinkedIn posts", repostai: "AI-written", repurposeio: false },
  { feature: "Instagram captions", repostai: "AI-written", repurposeio: false },
  { feature: "Twitter threads", repostai: "AI-written", repurposeio: false },
  { feature: "Telegram posts", repostai: true, repurposeio: false },
  { feature: "WhatsApp Status", repostai: true, repurposeio: false },
  { feature: "Brand voice training", repostai: true, repurposeio: false },
  { feature: "Photo → captions", repostai: true, repurposeio: false },
  { feature: "Free plan", repostai: "5 repurposes/mo", repurposeio: "14-day trial only", repostaiWins: true },
];

const FAQS = [
  {
    q: "Does Repurpose.io write captions?",
    a: "No. Repurpose.io does not write any content. It is a distribution automation tool — it takes a video you have already posted on one platform and automatically uploads that same video to other platforms. You still have to write all your captions manually, for every platform, every time.",
  },
  {
    q: "Does Repurpose.io use AI?",
    a: "No. Repurpose.io works on rule-based automation, not AI. You configure rules like 'when I post on YouTube, also post to Instagram and TikTok.' There is no language model, no text generation, and no content writing of any kind.",
  },
  {
    q: "What is better than Repurpose.io for Indian creators?",
    a: "RepostAI. It starts at ₹499/mo (vs ~₹2,450/mo for Repurpose.io), accepts UPI payments, and actually uses AI to write platform-native captions in Hindi and 8 other Indian languages. You paste a YouTube link and get fully written posts for LinkedIn, Instagram, Twitter, Telegram, and WhatsApp — no manual caption writing needed.",
  },
  {
    q: "Can RepostAI repurpose YouTube videos?",
    a: "Yes. RepostAI transcribes the YouTube video, understands the content, and writes platform-optimized posts for each platform — a LinkedIn post with a professional hook, a Twitter thread with numbered format, an Instagram caption with hashtags, and a Telegram newsletter post. All in your language, including Hindi.",
  },
  {
    q: "Who should actually use Repurpose.io?",
    a: "Repurpose.io is suitable for large video creators who exclusively want multi-platform video file distribution and never need AI-written text content. If your strategy is purely video-first and you are happy writing all captions yourself, Repurpose.io handles the upload automation. For anyone who wants AI to write the text — RepostAI is the right tool.",
  },
];

const ALSO_COMPARE = [
  { slug: "socialpilot", name: "SocialPilot" },
  { slug: "predis-ai", name: "Predis.ai" },
  { slug: "contentstudio", name: "ContentStudio" },
  { slug: "typefully", name: "Typefully" },
];

function BoolCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground font-medium">{value}</span>;
  }
  return value ? (
    <Check className="size-5 text-green-600 mx-auto" aria-label="Yes" />
  ) : (
    <X className="size-5 text-red-500 mx-auto" aria-label="No" />
  );
}

export default function RepurposeIoComparePage() {
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
            <span className="text-foreground font-medium">vs Repurpose.io</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-10 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-amber-200">
            <AlertCircle className="size-4" />
            Repurpose.io has zero AI — it just copies files
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            RepostAI vs Repurpose.io:{" "}
            <span className="text-primary">One Writes Your Content. One Just Copies It.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Repurpose.io moves your content between platforms.{" "}
            <strong className="text-foreground">RepostAI rewrites it</strong> for each platform —
            in Hindi, in the right format, with the right hook.
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

      {/* The Fundamental Difference */}
      <section className="pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-center">The fundamental difference</h2>
          <p className="text-muted-foreground text-center mb-10">
            This is not a minor feature gap. These are two completely different categories of tool.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Repurpose.io */}
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                  <Globe className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Repurpose.io</h3>
                  <p className="text-xs text-muted-foreground">Distribution tool</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                You record a YouTube video. Repurpose.io posts that <strong className="text-foreground">same video file</strong> to Facebook, Instagram, and TikTok automatically.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="font-medium mb-2 text-muted-foreground text-xs uppercase tracking-wide">What happens to your content</div>
                <div className="flex items-center gap-3 flex-wrap text-muted-foreground">
                  <span className="bg-background border rounded px-2 py-1 text-xs">YouTube video</span>
                  <ArrowRight className="size-3.5 flex-shrink-0" />
                  <span className="bg-background border rounded px-2 py-1 text-xs">Same video on all platforms</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Your captions? You write those yourself. For every platform. Every time.
                </p>
              </div>
              <div className="mt-4 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                <AlertCircle className="size-4 flex-shrink-0 mt-0.5" />
                <span>No AI. No text generation. No content writing. Rule-based automation only.</span>
              </div>
            </div>

            {/* RepostAI */}
            <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">RepostAI</h3>
                  <p className="text-xs text-primary/80 font-medium">AI repurposing engine</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                You paste a YouTube URL. RepostAI <strong className="text-foreground">transcribes, understands, and rewrites</strong> the content — optimized for each platform.
              </p>
              <div className="bg-background border rounded-lg p-4 text-sm space-y-2">
                <div className="font-medium mb-2 text-muted-foreground text-xs uppercase tracking-wide">What you get from one YouTube link</div>
                {[
                  "LinkedIn post — professional hook, key insights",
                  "Twitter/X thread — numbered, punchy format",
                  "Instagram caption — visual hook + hashtags",
                  "Telegram post — newsletter-style write-up",
                  "WhatsApp Status — short, conversational",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <Check className="size-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-foreground">{item}</span>
                  </div>
                ))}
                <p className="text-xs text-primary font-medium mt-2">All in Hindi if you want. Zero manual writing.</p>
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
            <p className="text-muted-foreground">Every feature that matters for content creators</p>
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
                  <th className="text-center px-5 py-4 font-semibold text-muted-foreground w-1/4">Repurpose.io</th>
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
                      <BoolCell value={row.repurposeio} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* What you get with Repurpose.io */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8">
            {/* Repurpose.io reality check */}
            <div>
              <h2 className="text-xl font-bold mb-5">
                What you actually get with Repurpose.io at ~₹2,450/mo
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  You record a YouTube video. Repurpose.io posts that video to Facebook, Instagram Reels, and TikTok. The &quot;repurposing&quot; is just uploading the same file to different platforms.
                </p>
                <p>
                  You still have to write your own captions. For every platform. Manually. Every single post.
                </p>
                <p>
                  There is no AI. There is no text generation. There is no Hindi support. There is no blog or PDF input. You are paying ~₹2,450/mo for copy-paste automation.
                </p>
              </div>
              <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">
                <h3 className="font-semibold text-red-900 mb-3 text-sm">What Repurpose.io cannot do</h3>
                <ul className="space-y-2">
                  {[
                    "Write a single word of content for you",
                    "Understand your video or generate a summary",
                    "Create platform-native text posts from any input",
                    "Support Hindi, Hinglish, or any Indian language",
                    "Take a blog URL or PDF and turn it into posts",
                    "Accept UPI payment or issue a GST invoice",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-red-800">
                      <X className="size-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* RepostAI reality */}
            <div>
              <h2 className="text-xl font-bold mb-5">
                What you actually get with RepostAI at ₹499/mo
              </h2>
              <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  Paste your YouTube URL. RepostAI transcribes it, understands it, then writes a LinkedIn post with professional hooks, a Twitter thread with numbered format, an Instagram caption with hashtags, and a Telegram newsletter post.
                </p>
                <p>
                  All in Hindi if you want. Or Marathi. Or Bengali. Or any of 8 Indian regional languages.
                </p>
                <p>
                  That&apos;s actual repurposing.
                </p>
              </div>
              <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
                <h3 className="font-semibold text-green-900 mb-3 text-sm">What RepostAI gives you</h3>
                <ul className="space-y-2">
                  {[
                    "AI writes every word — you just review and post",
                    "YouTube, PDF, blog URL, or plain text as input",
                    "10 platforms: Instagram, LinkedIn, Telegram, WhatsApp...",
                    "Hindi AI — Hinglish-aware, platform-native tone",
                    "Brand voice training so output sounds like you",
                    "UPI checkout + GST invoice — built for India",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-green-800">
                      <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who should use Repurpose.io */}
      <section className="py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">Who should actually use Repurpose.io</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-card border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Check className="size-5 text-green-600 flex-shrink-0" />
                <h3 className="font-semibold text-green-900">Repurpose.io makes sense if:</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You are a large video creator whose entire strategy is video-first, no text posts</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You only want video files auto-distributed to multiple platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You are happy writing all captions manually and just need the upload automated</span>
                </li>
              </ul>
            </div>
            <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="size-5 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-foreground">Choose RepostAI if:</h3>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You want AI to write the captions, threads, and posts for you</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your content includes blogs, PDFs, YouTube links, or any text source</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You need Hindi, Hinglish, or regional Indian language output</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>You want to pay with UPI and get a GST invoice — at 5x lower cost</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing callout */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border-2 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">5x cheaper. Infinitely more capable.</h2>
            <p className="text-muted-foreground mb-8">
              Repurpose.io starts at ~₹2,450/mo for rule-based video copy-paste. RepostAI starts at ₹499/mo for AI content generation across 10 platforms in Hindi.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="bg-muted/50 rounded-xl p-5">
                <div className="text-2xl font-bold text-muted-foreground mb-1">~₹2,450</div>
                <div className="text-xs text-muted-foreground">Repurpose.io / month</div>
                <div className="text-xs text-muted-foreground mt-1">No AI. No text writing.</div>
              </div>
              <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-5">
                <div className="text-2xl font-bold text-primary mb-1">₹499</div>
                <div className="text-xs text-primary/80 font-medium">RepostAI / month</div>
                <div className="text-xs text-muted-foreground mt-1">Full AI. 10 platforms. Hindi.</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Repurpose.io price at $29.08/mo annual, converted at approximate ₹84/USD.
            </p>
            <Button asChild size="lg">
              <Link href="/auth/signup">
                Start free with RepostAI
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
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
            Stop copying content.{" "}
            <br className="hidden sm:block" />
            Start repurposing it.
          </h2>
          <p className="text-primary-foreground/80 mb-3 text-lg">
            RepostAI uses AI to write platform-native posts in Hindi and 9 other languages — starting at ₹499/mo with UPI.
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
