"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Link as LinkIcon,
  Type,
  Youtube,
  FileText,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Send,
  CalendarClock,
  Info,
  Bot,
  ChevronRight,
  Scissors,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { InputType, Platform, OutputLanguage } from "@/types";
import {
  SUPPORTED_PLATFORMS,
  SUPPORTED_LANGUAGES,
  FREE_PLATFORM_IDS,
  CONTENT_ANGLES,
  HOOK_MODES,
} from "@/config/constants";

const INPUT_TABS = [
  { id: "text" as InputType, label: "Paste Text", icon: Type },
  { id: "url" as InputType, label: "Blog URL", icon: LinkIcon },
  { id: "youtube" as InputType, label: "YouTube", icon: Youtube },
  { id: "pdf" as InputType, label: "PDF", icon: FileText },
];

const FREE_PLATFORMS_SET = new Set<string>(FREE_PLATFORM_IDS);

function CharacterCount({
  content,
  platformId,
  maxLength,
  platformName,
}: {
  content: string;
  platformId: string;
  maxLength: number | null;
  platformName: string;
}) {
  const len = content.length;
  const isThread = platformId === "twitter_thread";
  const tweetLines = isThread
    ? content.split(/\n/).filter((l) => l.trim().length > 0)
    : [];
  const overLimit =
    maxLength != null &&
    (isThread
      ? tweetLines.some((l) => l.length > maxLength!)
      : len > maxLength);
  const overTweets =
    isThread && tweetLines.some((l) => l.length > 280)
      ? tweetLines.filter((l) => l.length > 280).length
      : 0;

  const isTwitterSingle = platformId === "twitter_single";
  const isInstagram = platformId === "instagram";
  const remaining = maxLength != null && !isThread ? maxLength - len : null;
  const firstLineLen = (isInstagram || isThread) ? (content.split("\n")[0]?.trim().length ?? 0) : 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {isThread ? (
        <>
          <span>{len} characters total</span>
          <span>·</span>
          <span>Each tweet ≤280 chars</span>
          {tweetLines.length > 0 && (
            <span>
              ({tweetLines.map((l, _i) => Math.max(0, 280 - l.length)).join(", ")} chars left per tweet)
            </span>
          )}
          {overTweets > 0 && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              {overTweets} tweet{overTweets > 1 ? "s" : ""} over limit
            </span>
          )}
        </>
      ) : isTwitterSingle && maxLength != null ? (
        <>
          <span className={overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""}>
            {len} / {maxLength}
          </span>
          <span>
            ({remaining != null && remaining >= 0 ? remaining : 0} left)
          </span>
          {overLimit && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">Over limit</span>
          )}
        </>
      ) : maxLength != null ? (
        <>
          <span className={overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""}>
            {len} / {maxLength} characters
          </span>
          {isInstagram && (
            <span title="First line visible before '...more'">
              · First line: {firstLineLen}/125
            </span>
          )}
          {overLimit && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              Over limit — trim for {platformName}
            </span>
          )}
        </>
      ) : (
        <span>{len} characters</span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [inputType, setInputType] = useState<InputType>("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "linkedin",
    "twitter_thread",
    "twitter_single",
    "email",
  ]);
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>("en");
  const [contentAngle, setContentAngle] = useState<string>("default");
  const [hookMode, setHookMode] = useState<string>("default");
  const [userIntent, setUserIntent] = useState("");
  const [brandVoiceId, setBrandVoiceId] = useState<string>("");
  const [brandVoices, setBrandVoices] = useState<{ id: string; name: string }[]>(
    []
  );
  const [outputs, setOutputs] = useState<
    { platform: Platform; content: string }[]
  >([]);
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [regeneratingPlatform, setRegeneratingPlatform] =
    useState<Platform | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [usage, setUsage] = useState<{
    count: number;
    limit: number;
  } | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<
    { id: string; platform: string }[]
  >([]);
  const [postingPlatform, setPostingPlatform] = useState<string | null>(null);
  const [bulkPosting, setBulkPosting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedulePlatform, setSchedulePlatform] = useState<Platform | null>(null);
  const [scheduleAccountId, setScheduleAccountId] = useState<string>("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleJobId, setScheduleJobId] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [pdfExtractedText, setPdfExtractedText] = useState<string>("");
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkSources, setBulkSources] = useState<
    { sourceUrl: string; jobId: string; outputs: { platform: Platform; content: string }[] }[]
  >([]);
  const [platformFitScores, setPlatformFitScores] = useState<
    { platform: string; score: number; reason: string; recommendation: "post" | "consider" | "skip" }[]
  >([]);
  const [platformFitLoading, setPlatformFitLoading] = useState(false);

  const isFreePlan = plan === "free";

  /** Map repurpose platform to connected_account platform for "Post now" */
  const platformProvider = (p: Platform): string | null => {
    if (p === "twitter_thread" || p === "twitter_single") return "twitter";
    if (p === "linkedin") return "linkedin";
    return null;
  };

  useEffect(() => {
    async function fetchConnections() {
      const { data } = await createClient()
        .from("connected_accounts")
        .select("id, platform");
      setConnectedAccounts(data ?? []);
    }
    fetchConnections();
  }, []);

  useEffect(() => {
    async function fetchMe() {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (res.ok) {
        setPlan(data.plan);
        if (data.repurposeCount !== null && data.repurposeLimit !== null) {
          setUsage({ count: data.repurposeCount, limit: data.repurposeLimit });
        }
      }
    }
    fetchMe();
  }, []);

  useEffect(() => {
    if (isFreePlan) {
      setSelectedPlatforms((prev) =>
        prev.filter((p) => FREE_PLATFORMS_SET.has(p))
      );
    }
  }, [isFreePlan]);

  useEffect(() => {
    if (!isFreePlan) {
      async function fetchVoices() {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("brand_voices")
          .select("id, name")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) setBrandVoices(data);
      }
      fetchVoices();
    }
  }, [isFreePlan]);

  function togglePlatform(platform: Platform) {
    if (isFreePlan && !FREE_PLATFORMS_SET.has(platform)) return;
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  function parseBulkUrls(text: string): string[] {
    return text
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function isValidUrl(s: string): boolean {
    try {
      new URL(s);
      return s.startsWith("http://") || s.startsWith("https://");
    } catch {
      return false;
    }
  }

  async function handleRepurpose() {
    if (inputType === "pdf") {
      if (!pdfExtractedText.trim()) {
        toast.error("Please upload a PDF first");
        return;
      }
    } else if (inputType === "text" && !content.trim()) {
      toast.error("Please paste some content first");
      return;
    }
    if (inputType === "youtube" && !url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    if (inputType === "url") {
      if (bulkMode) {
        const parsed = parseBulkUrls(bulkUrls);
        const valid = parsed.filter(isValidUrl);
        if (valid.length < 2 || valid.length > 5) {
          toast.error("Enter 2–5 valid blog URLs (one per line or comma-separated)");
          return;
        }
      } else if (!url.trim()) {
        toast.error("Please enter a URL");
        return;
      }
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    const isBulk = inputType === "url" && bulkMode;
    setLoading(true);
    setOutputs([]);
    setBulkSources([]);
    setPlatformFitScores([]);

    try {
      if (isBulk) {
        const parsed = parseBulkUrls(bulkUrls);
        const validUrls = parsed.filter(isValidUrl);
        const res = await fetch("/api/repurpose/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            urls: validUrls,
            platforms: selectedPlatforms,
            outputLanguage,
            brandVoiceId: brandVoiceId || undefined,
          userIntent: userIntent.trim() || undefined,
          contentAngle: contentAngle !== "default" ? contentAngle : undefined,
          hookMode: hookMode !== "default" ? hookMode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
        setBulkSources(
          data.sources.map((s: { sourceUrl: string; jobId: string; outputs: { platform: string; content: string }[] }) => ({
            sourceUrl: s.sourceUrl,
            jobId: s.jobId,
            outputs: s.outputs.map((o: { platform: string; content: string }) => ({
              platform: o.platform as Platform,
              content: o.content,
            })),
          }))
        );
        setLastJobId(data.sources?.[data.sources.length - 1]?.jobId ?? null);
        toast.success(`Generated ${data.totalOutputs} posts from ${data.sources.length} sources!`);
      } else {
        const res = await fetch("/api/repurpose", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inputType,
            content:
              inputType === "text"
                ? content
                : inputType === "pdf"
                  ? pdfExtractedText
                  : "Fetching from URL...",
            url: inputType !== "text" && inputType !== "pdf" ? url : undefined,
            platforms: selectedPlatforms,
          outputLanguage,
          brandVoiceId: brandVoiceId || undefined,
          userIntent: userIntent.trim() || undefined,
          contentAngle: contentAngle !== "default" ? contentAngle : undefined,
          hookMode: hookMode !== "default" ? hookMode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
        setOutputs(data.outputs);
        setLastJobId(data.jobId ?? null);
        toast.success(`Generated content for ${data.outputs.length} platforms!`);
        // Fetch platform fit analysis for single repurpose
        const outputsMap = (data.outputs as { platform: string; content: string }[]).reduce(
          (acc: Record<string, string>, o: { platform: string; content: string }) => {
            acc[o.platform] = o.content;
            return acc;
          },
          {}
        );
        if (Object.keys(outputsMap).length > 0) {
          setPlatformFitLoading(true);
          fetch("/api/repurpose/platform-fit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ outputs: outputsMap }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.scores?.length) setPlatformFitScores(d.scores);
            })
            .catch(() => {})
            .finally(() => setPlatformFitLoading(false));
        }
      }
      if (usage) {
        setUsage((u) => (u ? { ...u, count: u.count + 1 } : null));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(platform: string, text: string, copyKey?: string) {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(copyKey ?? platform);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedPlatform(null), 2000);
  }

  async function handleRegenerate(platform: Platform) {
    if (!lastJobId) {
      toast.error("Cannot regenerate. Repurpose again first.");
      return;
    }
    setRegeneratingPlatform(platform);
    try {
      const res = await fetch("/api/repurpose/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: lastJobId, platform }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Regeneration failed");
        return;
      }
      setOutputs((prev) =>
        prev.map((o) =>
          o.platform === platform ? { ...o, content: data.content } : o
        )
      );
      toast.success("Regenerated!");
    } catch {
      toast.error("Network error");
    } finally {
      setRegeneratingPlatform(null);
    }
  }

  function openScheduleModal(platform: Platform, jobId?: string) {
    const provider = platformProvider(platform);
    const acc = provider
      ? connectedAccounts.find((a) => a.platform === provider)
      : null;
    const jid = jobId ?? lastJobId;
    if (!acc) {
      toast.error(`Connect ${provider === "twitter" ? "Twitter" : "LinkedIn"} to schedule posts`);
      return;
    }
    if (!jid) {
      toast.error("Cannot schedule. Generate content again first.");
      return;
    }
    setSchedulePlatform(platform);
    setScheduleAccountId(acc.id);
    setScheduleJobId(jid);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduleAt(tomorrow.toISOString().slice(0, 16));
    setScheduleOpen(true);
  }

  async function handleScheduleSubmit() {
    const jid = scheduleJobId ?? lastJobId;
    if (!jid || !schedulePlatform || !scheduleAccountId || !scheduleAt) return;
    setScheduleSubmitting(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jid,
          platform: schedulePlatform,
          connectedAccountId: scheduleAccountId,
          scheduledAt: new Date(scheduleAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to schedule");
        return;
      }
      toast.success("Post scheduled!");
      setScheduleOpen(false);
      setScheduleJobId(null);
    } catch {
      toast.error("Network error");
    } finally {
      setScheduleSubmitting(false);
    }
  }

  async function handlePostNow(
    platform: Platform,
    connectedAccountId: string,
    jobId?: string
  ) {
    const jid = jobId ?? lastJobId;
    if (!jid) {
      toast.error("Cannot post. Repurpose again first.");
      return;
    }
    setPostingPlatform(platform);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jid,
          platform,
          connectedAccountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Post failed");
        return;
      }
      toast.success("Posted to " + (platform.includes("twitter") ? "X" : platform) + "!");
    } catch {
      toast.error("Network error");
    } finally {
      setPostingPlatform(null);
    }
  }

  async function handlePostAllConnected() {
    if (isFreePlan) {
      toast.error("Bulk posting is available on Pro and Agency plans.");
      return;
    }
    if (!lastJobId) {
      toast.error("Cannot post. Repurpose again first.");
      return;
    }

    const tasks: { platform: Platform; connectedAccountId: string; label: string }[] = [];

    for (const output of outputs) {
      const provider = platformProvider(output.platform);
      if (!provider) continue;
      const account = connectedAccounts.find((a) => a.platform === provider);
      if (!account) continue;
      const platformInfo = SUPPORTED_PLATFORMS.find((p) => p.id === output.platform);
      tasks.push({
        platform: output.platform,
        connectedAccountId: account.id,
        label: platformInfo?.name || output.platform,
      });
    }

    if (tasks.length === 0) {
      toast.error("No connected accounts for the selected platforms.");
      return;
    }

    setBulkPosting(true);
    const successes: string[] = [];
    const failures: string[] = [];

    try {
      for (const task of tasks) {
        try {
          const res = await fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jobId: lastJobId,
              platform: task.platform,
              connectedAccountId: task.connectedAccountId,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            failures.push(task.label);
            console.error("Bulk post failed:", task.platform, data);
            continue;
          }
          successes.push(task.label);
        } catch (e) {
          console.error("Bulk post network error:", task.platform, e);
          failures.push(task.label);
        }
      }
    } finally {
      setBulkPosting(false);
    }

    if (successes.length) {
      toast.success(`Posted to: ${successes.join(", ")}`);
    }
    if (failures.length) {
      toast.error(`Failed on: ${failures.join(", ")}. Check connections and try again.`);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Repurpose Content</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Paste your content and generate platform-ready posts in seconds — now including TikTok and WhatsApp Status.
            </p>
        </div>
        {usage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {usage.count} of {usage.limit} repurposes this month
            </span>
            {usage.count >= usage.limit - 1 && (
              <Link href="/dashboard/settings">
                <Button size="sm" variant="outline">
                  Upgrade
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Content Agent CTA */}
      <Link href="/dashboard/agent">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 hover:to-primary/5 transition-colors cursor-pointer">
          <CardContent className="py-4 flex items-center gap-4">
            <Bot className="h-10 w-10 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Content Agent — Plan your entire content week</p>
              <p className="text-sm text-muted-foreground">
                Paste a blog URL → AI suggests platforms, optimal times, generates all variations, and schedules them.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={inputType}
            onValueChange={(v) => setInputType(v as InputType)}
          >
            <TabsList className="grid grid-cols-4 w-full max-w-md min-h-[44px]">
              {INPUT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 text-xs sm:text-sm min-h-[44px] touch-manipulation"
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder="Paste your blog post, article, or any text content here..."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setBulkMode(false);
                    setBulkUrls("");
                  }}
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                    !bulkMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Single URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBulkMode(true);
                    setUrl("");
                  }}
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                    bulkMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Bulk (2–5 URLs)
                </button>
              </div>
              {bulkMode ? (
                <div>
                  <Label htmlFor="bulk-urls">Blog URLs (one per line or comma-separated)</Label>
                  <Textarea
                    id="bulk-urls"
                    placeholder={"https://example.com/post-1\nhttps://example.com/post-2\nhttps://example.com/post-3"}
                    className="min-h-[140px] mt-2 font-mono text-sm"
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Paste 2–5 blog URLs. We&apos;ll extract each article and generate {selectedPlatforms.length} platforms × your URLs = up to {selectedPlatforms.length * 5} posts in one queue.
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="blog-url">Blog Post URL</Label>
                  <Input
                    id="blog-url"
                    type="url"
                    placeholder="https://example.com/my-blog-post"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We&apos;ll automatically extract the article content.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="youtube" className="mt-4 space-y-3">
              <div>
                <Label htmlFor="yt-url">YouTube Video URL</Label>
                <Input
                  id="yt-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;ll extract the transcript automatically. The video
                  must have captions enabled.
                </p>
              </div>
              <Link href="/dashboard/clips" className="block">
                <p className="text-sm text-primary hover:underline flex items-center gap-1.5">
                  <Scissors className="h-4 w-4" />
                  Extract viral clips from long videos →
                </p>
              </Link>
            </TabsContent>

            <TabsContent value="pdf" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <Label htmlFor="pdf-upload" className="cursor-pointer block">
                  <div className="text-center py-4">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      {pdfFileName ? pdfFileName : "Click to upload PDF"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 10MB. Text will be extracted automatically.
                    </p>
                    {pdfExtracting && (
                      <Loader2 className="h-5 w-5 mx-auto mt-2 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </Label>
                <input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  disabled={pdfExtracting}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPdfExtracting(true);
                    setPdfFileName("");
                    setPdfExtractedText("");
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      const res = await fetch("/api/pdf/extract", {
                        method: "POST",
                        body: formData,
                      });
                      let data: { error?: string; text?: string };
                      try {
                        data = await res.json();
                      } catch {
                        toast.error("Invalid response from server");
                        return;
                      }
                      if (!res.ok) {
                        toast.error(data.error || "Failed to extract text");
                        return;
                      }
                      setPdfFileName(file.name);
                      setPdfExtractedText(data.text ?? "");
                      toast.success("PDF text extracted!");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to process PDF");
                    } finally {
                      setPdfExtracting(false);
                      e.target.value = "";
                    }
                  }}
                />
                {pdfExtractedText && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {pdfExtractedText.length} characters extracted
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Brand Voice (Pro/Agency only) */}
      {!isFreePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Brand Voice</CardTitle>
            <p className="text-sm text-muted-foreground">
              Match your writing style (optional)
            </p>
          </CardHeader>
          <CardContent>
            <Select
              value={brandVoiceId || "none"}
              onValueChange={(v) => setBrandVoiceId(v === "none" ? "" : v)}
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="No brand voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No brand voice</SelectItem>
                {brandVoices.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Platform Selection — touch-optimized (min 44px tap targets) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Output Platforms</CardTitle>
          {isFreePlan && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              Free plan: LinkedIn, Twitter/X, Email.{" "}
              <Link href="/dashboard/settings" className="text-primary hover:underline">
                Upgrade
              </Link>{" "}
              for all 7 platforms.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {SUPPORTED_PLATFORMS.map((platform) => {
              const isLocked = isFreePlan && !FREE_PLATFORMS_SET.has(platform.id);
              const isSelected = selectedPlatforms.includes(platform.id as Platform);
              return (
                <button
                  key={platform.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => !isLocked && togglePlatform(platform.id as Platform)}
                  title={
                    isLocked
                      ? "Upgrade to Pro for Instagram, Facebook, Reddit"
                      : undefined
                  }
                  className={`
                    inline-flex items-center gap-2 rounded-md border text-sm font-medium transition-colors
                    min-h-[44px] px-4 py-3 touch-manipulation select-none
                    ${isLocked
                      ? "opacity-60 cursor-not-allowed border-muted bg-muted/50 text-muted-foreground"
                      : isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-muted/50 border-input"
                    }
                  `}
                >
                  {isLocked && <Lock className="h-4 w-4 shrink-0" />}
                  {isSelected && !isLocked && <Check className="h-4 w-4 shrink-0" />}
                  {platform.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Content Angle + Hook Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate as</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the angle and hook style — the first line drives 80% of engagement
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Content angle</Label>
              <Select value={contentAngle} onValueChange={setContentAngle}>
                <SelectTrigger className="w-full min-h-[44px] mt-1">
                  <SelectValue placeholder="Select angle" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_ANGLES.map((angle) => (
                    <SelectItem key={angle.id} value={angle.id} title={angle.description}>
                      {angle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Hook mode — first line drives 80% of engagement</Label>
              <Select value={hookMode} onValueChange={setHookMode}>
                <SelectTrigger className="w-full min-h-[44px] mt-1">
                  <SelectValue placeholder="Select hook" />
                </SelectTrigger>
                <SelectContent>
                  {HOOK_MODES.map((mode) => (
                    <SelectItem key={mode.id} value={mode.id} title={mode.description}>
                      {mode.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Output Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={outputLanguage}
              onValueChange={(v) => setOutputLanguage(v as OutputLanguage)}
            >
              <SelectTrigger className="w-full sm:w-[220px] min-h-[44px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({lang.nativeName})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {outputLanguage === "en" && "Content will be generated in English"}
              {outputLanguage === "hi" && "कंटेंट हिन्दी में जनरेट होगा"}
              {outputLanguage === "es" && "El contenido se generará en español"}
              {outputLanguage === "pt" && "O conteúdo será gerado em português"}
              {outputLanguage === "fr" && "Le contenu sera généré en français"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What you want — optional intent */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">What do you want from this piece? (optional)</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            We&apos;ll prioritize your goal when generating — e.g. more engagement, more casual, or emphasize a specific angle.
          </p>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="e.g. More engagement, more casual, emphasize the launch date..."
            value={userIntent}
            onChange={(e) => setUserIntent(e.target.value)}
            className="max-w-xl"
            maxLength={300}
          />
          {userIntent.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">{userIntent.length}/300</p>
          )}
        </CardContent>
      </Card>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0" />
        For serious or sensitive topics, we match tone to the subject.
      </p>

      {/* Generate Button — touch-friendly */}
      <Button
        size="lg"
        className="w-full min-h-[48px] text-base sm:text-lg touch-manipulation"
        onClick={handleRepurpose}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            {inputType === "url" && bulkMode
              ? `Generating (${parseBulkUrls(bulkUrls).filter(isValidUrl).length} sources × ${selectedPlatforms.length} platforms)...`
              : `Generating (${selectedPlatforms.length} platforms)...`}
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5 mr-2" />
            {inputType === "url" && bulkMode
              ? `Bulk Repurpose (${selectedPlatforms.length} platforms × your URLs)`
              : `Repurpose to ${selectedPlatforms.length} Platforms`}
          </>
        )}
      </Button>

      {/* Output Section — single column on mobile */}
      {(outputs.length > 0 || bulkSources.length > 0) && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get the output you want — edit or regenerate until it&apos;s right, then post when you&apos;re ready.
            {isFreePlan && (
              <span className="block mt-1 text-xs">
                Free posts include a small &quot;Repurposed with RepostAI&quot; watermark. <Link href="/pricing" className="text-primary hover:underline">Upgrade to Pro</Link> to remove it.
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold">Generated Content</h2>
            {!isFreePlan && bulkSources.length === 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePostAllConnected}
                  disabled={bulkPosting}
                >
                  {bulkPosting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Posting to all connected...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Post to all connected
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Posts to every platform with a connected account.
                </p>
              </div>
            )}
          </div>
          {/* Where to Post — platform fit scorecard (single repurpose only) */}
          {outputs.length > 0 && bulkSources.length === 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Where to Post
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI analysis of which platforms will perform best for this content
                </p>
              </CardHeader>
              <CardContent>
                {platformFitLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing platform fit...
                  </div>
                ) : platformFitScores.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {platformFitScores.map((s) => {
                        const info = SUPPORTED_PLATFORMS.find((p) => p.id === s.platform);
                        const isPost = s.recommendation === "post";
                        const isSkip = s.recommendation === "skip";
                        return (
                          <div
                            key={s.platform}
                            className={`rounded-lg border p-3 text-sm ${
                              isPost ? "border-green-500/30 bg-green-500/5" : isSkip ? "border-muted bg-muted/30" : "border-amber-500/20 bg-amber-500/5"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{info?.name ?? s.platform}</span>
                              <span className={`font-mono text-xs font-semibold ${isPost ? "text-green-600" : isSkip ? "text-muted-foreground" : "text-amber-600"}`}>
                                {s.score.toFixed(1)}/10
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.reason}</p>
                            <div className="flex items-center gap-1 mt-2">
                              {isPost && <ThumbsUp className="h-3 w-3 text-green-600" />}
                              {isSkip && <ThumbsDown className="h-3 w-3 text-muted-foreground" />}
                              <span className={`text-xs font-medium ${isPost ? "text-green-600" : isSkip ? "text-muted-foreground" : "text-amber-600"}`}>
                                {isPost ? "Post" : isSkip ? "Consider skipping" : "Consider"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {platformFitScores.some((s) => s.recommendation === "skip") && (
                      <p className="text-xs text-muted-foreground">
                        Focus on high-scoring platforms. Skip the weak ones to save time.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2">Platform analysis unavailable</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-8">
            {bulkSources.length > 0 ? (
              bulkSources.map((source, idx) => (
                <div key={source.jobId} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Source {idx + 1}</span>
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate max-w-md"
                    >
                      {source.sourceUrl}
                    </a>
                    {!isFreePlan && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setBulkPosting(true);
                          const tasks: { platform: Platform; connectedAccountId: string; label: string }[] = [];
                          for (const o of source.outputs) {
                            const prov = platformProvider(o.platform);
                            const acc = prov ? connectedAccounts.find((a) => a.platform === prov) : null;
                            if (acc) tasks.push({ platform: o.platform, connectedAccountId: acc.id, label: SUPPORTED_PLATFORMS.find((p) => p.id === o.platform)?.name ?? o.platform });
                          }
                          const successes: string[] = [];
                          const failures: string[] = [];
                          for (const t of tasks) {
                            try {
                              const res = await fetch("/api/post", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ jobId: source.jobId, platform: t.platform, connectedAccountId: t.connectedAccountId }),
                              });
                              if (res.ok) successes.push(t.label);
                              else failures.push(t.label);
                            } catch {
                              failures.push(t.label);
                            }
                          }
                          setBulkPosting(false);
                          if (successes.length) toast.success(`Posted to: ${successes.join(", ")}`);
                          if (failures.length) toast.error(`Failed: ${failures.join(", ")}`);
                        }}
                        disabled={bulkPosting}
                      >
                        Post this source
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    {source.outputs.map((output) => {
                      const platformInfo = SUPPORTED_PLATFORMS.find((p) => p.id === output.platform);
                      const provider = platformProvider(output.platform);
                      const account = provider ? connectedAccounts.find((a) => a.platform === provider) : null;
                      return (
                        <Card key={output.platform}>
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-2">
                              <CardTitle className="text-base">{platformInfo?.name || output.platform}</CardTitle>
                              <div className="flex gap-2 flex-wrap items-center">
                                {provider && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="min-h-[40px] touch-manipulation"
                                      onClick={() => account && handlePostNow(output.platform, account.id, source.jobId)}
                                      disabled={postingPlatform !== null || !account || bulkPosting}
                                      title={!account ? `Connect ${provider}` : undefined}
                                    >
                                      {postingPlatform === output.platform ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Send className="h-3.5 w-3.5 mr-1" /> Post now</>}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="min-h-[40px] touch-manipulation"
                                      onClick={() => openScheduleModal(output.platform, source.jobId)}
                                      disabled={scheduleSubmitting}
                                      title={!account ? `Connect ${provider} to schedule` : undefined}
                                    >
                                      <CalendarClock className="h-3.5 w-3.5 mr-1" />
                                      Schedule
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="min-h-[40px] touch-manipulation"
                                  onClick={() => handleCopy(output.platform, output.content, `${source.jobId}-${output.platform}`)}
                                >
                                  {copiedPlatform === `${source.jobId}-${output.platform}` ? <><Check className="h-3.5 w-3.5 mr-1" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" /> Copy</>}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                              {output.content}
                            </div>
                            {platformInfo && <CharacterCount content={output.content} platformId={output.platform} maxLength={platformInfo.maxLength} platformName={platformInfo.name} />}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {outputs.map((output) => {
                const platformInfo = SUPPORTED_PLATFORMS.find(
                  (p) => p.id === output.platform
                );
                const provider = platformProvider(output.platform);
                const account = provider
                  ? connectedAccounts.find((a) => a.platform === provider)
                  : null;
                return (
                  <Card key={output.platform}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">
                        {platformInfo?.name || output.platform}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap items-center">
                        {provider && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="min-h-[40px] touch-manipulation"
                              onClick={() =>
                                account
                                  ? handlePostNow(output.platform, account.id)
                                  : undefined
                              }
                              disabled={postingPlatform !== null || !account || bulkPosting}
                              title={!account ? `Connect ${provider === "twitter" ? "Twitter" : "LinkedIn"} to post` : undefined}
                            >
                              {postingPlatform === output.platform ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5 mr-1" />
                                  Post now
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-[40px] touch-manipulation"
                              onClick={() => openScheduleModal(output.platform)}
                              disabled={scheduleSubmitting}
                              title={!account ? `Connect ${provider === "twitter" ? "Twitter" : "LinkedIn"} to schedule` : undefined}
                            >
                              <CalendarClock className="h-3.5 w-3.5 mr-1" />
                              Schedule
                            </Button>
                            {!account && (
                              <Link
                                href="/dashboard/connections"
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                Connect {provider === "twitter" ? "Twitter" : "LinkedIn"}
                              </Link>
                            )}
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="min-h-[40px] touch-manipulation"
                          onClick={() => handleRegenerate(output.platform)}
                          disabled={regeneratingPlatform !== null}
                        >
                          {regeneratingPlatform === output.platform ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 mr-1" />
                              Regenerate
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="min-h-[40px] touch-manipulation"
                          onClick={() =>
                            handleCopy(output.platform, output.content)
                          }
                        >
                          {copiedPlatform === output.platform ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {output.content}
                    </div>
                    {platformInfo && (
                      <CharacterCount
                        content={output.content}
                        platformId={output.platform}
                        maxLength={platformInfo.maxLength}
                        platformName={platformInfo.name}
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Date & time</label>
              <input
                type="datetime-local"
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={scheduleAt}
                onChange={(e) => setScheduleAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              disabled={scheduleSubmitting}
            >
              {scheduleSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Schedule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
