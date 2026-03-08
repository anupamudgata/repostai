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
              ({tweetLines.map((l, i) => Math.max(0, 280 - l.length)).join(", ")} chars left per tweet)
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
    { id: string; provider: string }[]
  >([]);
  const [postingPlatform, setPostingPlatform] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [schedulePlatform, setSchedulePlatform] = useState<Platform | null>(null);
  const [scheduleAccountId, setScheduleAccountId] = useState<string>("");
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  const isFreePlan = plan === "free";

  /** Map platform to connected_account provider for "Post now" */
  const platformProvider = (p: Platform): string | null => {
    if (p === "twitter_thread" || p === "twitter_single") return "twitter";
    if (p === "linkedin") return "linkedin";
    return null;
  };

  useEffect(() => {
    async function fetchConnections() {
      const { data } = await createClient()
        .from("connected_accounts")
        .select("id, provider");
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

  async function handleRepurpose() {
    if (inputType === "pdf") {
      toast.error("PDF upload is coming soon. Please use the Text tab to paste your content.");
      return;
    }
    if (inputType === "text" && !content.trim()) {
      toast.error("Please paste some content first");
      return;
    }
    if ((inputType === "url" || inputType === "youtube") && !url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setLoading(true);
    setOutputs([]);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType,
          content: inputType === "text" ? content : "Fetching from URL...",
          url: inputType !== "text" ? url : undefined,
          platforms: selectedPlatforms,
          outputLanguage,
          brandVoiceId: brandVoiceId || undefined,
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
      if (usage) {
        setUsage((u) => (u ? { ...u, count: u.count + 1 } : null));
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(platform: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
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

  function openScheduleModal(platform: Platform) {
    const provider = platformProvider(platform);
    const acc = provider
      ? connectedAccounts.find((a) => a.provider === provider)
      : null;
    if (!acc || !lastJobId) return;
    setSchedulePlatform(platform);
    setScheduleAccountId(acc.id);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduleAt(tomorrow.toISOString().slice(0, 16));
    setScheduleOpen(true);
  }

  async function handleScheduleSubmit() {
    if (!lastJobId || !schedulePlatform || !scheduleAccountId || !scheduleAt) return;
    setScheduleSubmitting(true);
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: lastJobId,
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
    } catch {
      toast.error("Network error");
    } finally {
      setScheduleSubmitting(false);
    }
  }

  async function handlePostNow(
    platform: Platform,
    connectedAccountId: string
  ) {
    if (!lastJobId) {
      toast.error("Cannot post. Repurpose again first.");
      return;
    }
    setPostingPlatform(platform);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: lastJobId,
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

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Repurpose Content</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Paste your content and generate platform-ready posts in seconds.
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

            <TabsContent value="url" className="mt-4">
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
            </TabsContent>

            <TabsContent value="youtube" className="mt-4">
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
            </TabsContent>

            <TabsContent value="pdf" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  PDF upload coming soon. For now, copy-paste your PDF content
                  into the Text tab.
                </p>
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
              {outputLanguage === "en"
                ? "Content will be generated in English"
                : outputLanguage === "hi"
                  ? "कंटेंट हिन्दी में जनरेट होगा"
                  : "El contenido se generará en español"}
            </p>
          </div>
        </CardContent>
      </Card>

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
            Generating ({selectedPlatforms.length} platforms)...
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5 mr-2" />
            Repurpose to {selectedPlatforms.length} Platforms
          </>
        )}
      </Button>

      {/* Output Section — single column on mobile */}
      {outputs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Generated Content</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {outputs.map((output) => {
              const platformInfo = SUPPORTED_PLATFORMS.find(
                (p) => p.id === output.platform
              );
              const provider = platformProvider(output.platform);
              const account = provider
                ? connectedAccounts.find((a) => a.provider === provider)
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
                              disabled={postingPlatform !== null || !account}
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
                              onClick={() => account && openScheduleModal(output.platform)}
                              disabled={!account}
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
