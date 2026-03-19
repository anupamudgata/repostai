"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Loader2,
  Check,
  CalendarClock,
  Sparkles,
  MessageCircle,
  Share2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPPORTED_PLATFORMS } from "@/config/constants";
import { toast } from "sonner";
import type { Platform } from "@/types";

type ScheduleItem = {
  platform: string;
  reason: string;
  scheduledAt: string;
  canSchedule: boolean;
  connectedAccountId: string | null;
};

const ENGAGEMENT_PROMPTS = [
  { icon: MessageCircle, text: "Reply to comments within 2 hours of posting" },
  { icon: Share2, text: "Share your top-performing post to your story" },
  { icon: CalendarClock, text: "Check engagement 24 hours after each post" },
];

export default function AgentPage() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"url" | "plan" | "generating" | "scheduling" | "done">("url");
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [, setContentPreview] = useState("");
  const [, setJobId] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<{ platform: string; content: string }[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!url.trim()) {
      toast.error("Enter a blog URL");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      let data: { error?: string; schedule?: ScheduleItem[]; contentPreview?: string };
      try {
        data = await res.json();
      } catch {
        setError("Invalid response from server. Please try again.");
        toast.error("Could not read server response");
        return;
      }
      if (!res.ok) {
        const errMsg = data.error || "Could not analyze this URL";
        setError(errMsg);
        toast.error(errMsg);
        return;
      }
      const scheduleData = data.schedule ?? [];
      if (scheduleData.length === 0) {
        setError("No platforms suggested. The URL may be inaccessible, behind a paywall, or the content couldn't be extracted. Try a publicly accessible blog URL.");
        toast.error("No content plan generated");
        return;
      }
      setSchedule(scheduleData);
      setContentPreview(data.contentPreview ?? "");
      setStep("plan");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error. Please check your connection and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleExecute() {
    if (schedule.length === 0) return;
    setStep("generating");
    setLoading(true);

    try {
      const platforms = schedule.map((s) => s.platform) as Platform[];
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: "url",
          content: "Fetching...",
          url: url.trim(),
          platforms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate");
        setStep("plan");
        return;
      }
      setJobId(data.jobId);
      setOutputs(data.outputs ?? []);

      const toSchedule = schedule.filter((s) => s.canSchedule && s.connectedAccountId);
      if (toSchedule.length === 0) {
        setStep("done");
        setLoading(false);
        return;
      }

      setStep("scheduling");
      let count = 0;
      for (const item of toSchedule) {
        const scheduleRes = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: data.jobId,
            platform: item.platform,
            connectedAccountId: item.connectedAccountId,
            scheduledAt: item.scheduledAt,
          }),
        });
        if (scheduleRes.ok) count++;
      }

      setScheduledCount(count);
      setStep("done");
    } catch {
      toast.error("Something went wrong");
      setStep("plan");
    } finally {
      setLoading(false);
    }
  }

  const getPlatformName = (id: string) =>
    SUPPORTED_PLATFORMS.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          Content Agent
        </h1>
        <p className="text-muted-foreground mt-1">
          Paste your blog URL → AI plans your content week, generates all variations, and schedules them.
        </p>
      </div>

      {step === "url" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your blog URL</CardTitle>
            <p className="text-sm text-muted-foreground">
              The agent will analyze your content and suggest the best platforms and posting times.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agent-url">Blog post URL</Label>
              <Input
                id="agent-url"
                type="url"
                placeholder="https://yourblog.com/post"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                className="mt-2"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Plan my content week
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "plan" && schedule.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your content week</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI-suggested platforms and schedule. Click Execute to generate and schedule.
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {schedule.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getPlatformName(item.platform)}
                        </span>
                        {item.canSchedule ? (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Will schedule
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Copy manually
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.reason}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setStep("url")}>
                  Back
                </Button>
                <Button
                  onClick={handleExecute}
                  disabled={loading}
                  className="gap-2 flex-1"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate & schedule all
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(step === "generating" || step === "scheduling") && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="font-medium">
              {step === "generating"
                ? "Generating content for all platforms..."
                : "Scheduling posts to your calendar..."}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This may take a minute
            </p>
          </CardContent>
        </Card>
      )}

      {step === "done" && (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-8 text-center">
              <Check className="h-16 w-16 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold">Your content week is planned</h2>
              <p className="text-muted-foreground mt-2">
                {scheduledCount > 0
                  ? `${scheduledCount} post${scheduledCount > 1 ? "s" : ""} scheduled. `
                  : ""}
                {outputs.length} platform variations generated.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-6">
                <Button asChild>
                  <Link href="/dashboard/scheduled">View calendar</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/history">View history</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/agent">Plan another</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Engagement prompts
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Follow up to maximize reach and engagement
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {ENGAGEMENT_PROMPTS.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border p-4"
                  >
                    <item.icon className="h-5 w-5 text-primary shrink-0" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {!schedule.some((s) => s.canSchedule) && step === "plan" && schedule.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <p className="text-sm">
              <strong>Connect accounts to schedule.</strong>{" "}
              <Link href="/dashboard/connections" className="text-primary hover:underline">
                Connect LinkedIn or Twitter
              </Link>{" "}
              to auto-schedule. Without connections, we&apos;ll generate all content for you to copy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
