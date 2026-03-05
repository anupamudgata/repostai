import Link from "next/link";
import { ArrowRight, Zap, Globe, Sparkles, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS, SUPPORTED_PLATFORMS } from "@/config/constants";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">RepostAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition">
              Pricing
            </a>
            <a href="#platforms" className="hover:text-foreground transition">
              Platforms
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Start Free <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Content Repurposing
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
            One post.{" "}
            <span className="text-primary">Every platform.</span>
            <br />
            Under 60 seconds.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Paste a blog post, YouTube link, or any text. Get perfectly
            formatted, platform-native content for LinkedIn, Twitter/X,
            Instagram, Email & more — in one click.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free — No Credit Card
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="text-lg px-8">
                See it in action
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            5 free repurposes/month. No credit card required.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <p className="text-muted-foreground">
            Trusted by creators & marketers worldwide
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why creators love RepostAI
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stop spending hours reformatting. Let AI handle the heavy lifting
              while you focus on creating.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "60-Second Turnaround",
                description:
                  "Paste your content and get all platforms generated simultaneously. No waiting, no manual formatting.",
              },
              {
                icon: Globe,
                title: "7+ Platforms at Once",
                description:
                  "LinkedIn, Twitter/X threads, Instagram captions, Facebook, Email newsletters, Reddit — all from one input.",
              },
              {
                icon: Sparkles,
                title: "Your Voice, Not AI Slop",
                description:
                  "Train the AI on your writing style. Every output sounds like YOU wrote it, not a generic chatbot.",
              },
            ].map((feature) => (
              <Card key={feature.title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            One input. Every platform covered.
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Accepts blog URLs, YouTube videos, PDFs, or raw text. Outputs
            platform-native content.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SUPPORTED_PLATFORMS.map((platform) => (
              <Card key={platform.id} className="border shadow-sm">
                <CardContent className="py-6 text-center">
                  <p className="font-medium">{platform.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Start free. Upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {Object.values(PLANS).map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.name === "Pro" ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.name === "Pro" && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="pt-8 pb-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${plan.monthlyPrice}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      className="w-full"
                      variant={plan.name === "Pro" ? "default" : "outline"}
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

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Stop wasting hours on content formatting
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Join thousands of creators who repurpose smarter, not harder. Start
            with 5 free repurposes today.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-bold">RepostAI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-foreground transition">
                Terms of Service
              </a>
              <a
                href="mailto:support@repostai.com"
                className="hover:text-foreground transition"
              >
                Contact
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} RepostAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
