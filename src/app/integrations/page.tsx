import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Linkedin,
  Twitter,
  Instagram,
  Calendar,
  Webhook,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LandingNav } from "@/components/landing-nav";
import { ZAPIER_APP_URL, SUPPORT_EMAIL } from "@/config/constants";

const FEATURES = [
  {
    icon: Linkedin,
    title: "1-click publish to LinkedIn",
    description: "Send repurposed content straight to LinkedIn from your Zap.",
  },
  {
    icon: Twitter,
    title: "1-click publish to Twitter/X",
    description: "Post threads or single tweets automatically when you repurpose.",
  },
  {
    icon: Instagram,
    title: "1-click publish to Instagram",
    description: "Push captions (and later media) to Instagram via Zapier.",
  },
  {
    icon: Calendar,
    title: "Schedule posts",
    description: "Use Zapier + your scheduler (Buffer, Hootsuite, etc.) to schedule repurposed content.",
  },
  {
    icon: Webhook,
    title: "Auto-post with API",
    description: "Trigger Zaps from RepostAI and post to 1000+ apps—CRMs, tools, custom workflows.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <Badge variant="secondary" className="mb-4">
            Zapier
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Publish to{" "}
            <span className="text-primary">1000+ apps</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect RepostAI to Zapier and send your repurposed content to LinkedIn, Twitter,
            Instagram, Notion, Slack, and 1000+ other apps—no code required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FEATURES.map((f) => (
            <Card key={f.title} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-12 border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-primary/10 shrink-0">
                <Plug className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-semibold mb-1">How it works</h2>
                <p className="text-sm text-muted-foreground">
                  Connect RepostAI in Zapier as a trigger (e.g. &quot;New repurposed content&quot;).
                  Then add actions: post to LinkedIn, Twitter, Instagram, or any of 1000+ apps.
                  One Zap, zero friction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          {ZAPIER_APP_URL ? (
            <a href={ZAPIER_APP_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="min-h-[48px] px-8 gap-2">
                <Zap className="h-5 w-5" />
                Connect with Zapier
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <>
              <Button size="lg" className="min-h-[48px] px-8 gap-2" disabled>
                <Zap className="h-5 w-5" />
                Zapier integration coming soon
              </Button>
              <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                We&apos;re building the Zapier app now. Want early access?{" "}
                <a href={`mailto:${SUPPORT_EMAIL}?subject=Zapier%20early%20access`} className="text-primary hover:underline">
                  Email us
                </a>
                .
              </p>
            </>
          )}
          <div className="mt-8">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
