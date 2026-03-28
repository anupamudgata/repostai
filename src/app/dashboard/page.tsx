"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const OnboardingBanner = dynamic(
  () => import("@/components/dashboard/OnboardingBanner"),
  { ssr: false }
);
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
import { useAppToast } from "@/hooks/use-app-toast";
import { useI18n } from "@/contexts/i18n-provider";
import { dashboardBulkEn } from "@/messages/dashboard-bulk.en";
import { dashboardBulkHi } from "@/messages/dashboard-bulk.hi";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import type { InputType, Platform, OutputLanguage } from "@/types";
import {
  SUPPORTED_PLATFORMS,
  SUPPORTED_LANGUAGES,
  FREE_PLATFORM_IDS,
  CONTENT_ANGLES,
  HOOK_MODES,
} from "@/config/constants";
import { cn } from "@/lib/utils";

const INPUT_TABS = [
  { id: "text" as InputType, icon: Type },
  { id: "url" as InputType, icon: LinkIcon },
  { id: "youtube" as InputType, icon: Youtube },
  { id: "pdf" as InputType, icon: FileText },
];

const FREE_PLATFORMS_SET = new Set<string>(FREE_PLATFORM_IDS);

function charDf(
  template: string,
  vars: Record<string, string | number>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

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
  const { locale } = useI18n();
  const d = locale === "hi" ? dashboardBulkHi : dashboardBulkEn;
  const c = d.charCount;
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
          <span>{charDf(c.threadTotal, { count: len })}</span>
          <span>·</span>
          <span>{c.threadEach280}</span>
          {tweetLines.length > 0 && (
            <span>
              (
              {tweetLines.map((l, _i) => Math.max(0, 280 - l.length)).join(", ")}{" "}
              {c.threadLeftSuffix})
            </span>
          )}
          {overTweets > 0 && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              {overTweets === 1
                ? c.tweetOverLimitOne
                : charDf(c.tweetOverLimitMany, { count: overTweets })}
            </span>
          )}
        </>
      ) : isTwitterSingle && maxLength != null ? (
        <>
          <span className={overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""}>
            {len} / {maxLength}
          </span>
          <span>
            {charDf(c.leftParen, {
              count: remaining != null && remaining >= 0 ? remaining : 0,
            })}
          </span>
          {overLimit && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">{c.overLimit}</span>
          )}
        </>
      ) : maxLength != null ? (
        <>
          <span className={overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""}>
            {charDf(c.slashChars, { current: len, max: maxLength })}
          </span>
          {isInstagram && (
            <span title={c.firstLineTooltip}>
              {charDf(c.firstLineBadge, { current: firstLineLen })}
            </span>
          )}
          {overLimit && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              {charDf(c.overLimitTrim, { platform: platformName })}
            </span>
          )}
        </>
      ) : (
        <span>{charDf(c.plainChars, { count: len })}</span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const { locale } = useI18n();
  const d = locale === "hi" ? dashboardBulkHi : dashboardBulkEn;
  const toastT = useAppToast();

  function providerLabel(p: string) {
    if (p === "twitter") return d.labelTwitter;
    if (p === "linkedin") return d.labelLinkedIn;
    return p;
  }

  function df(
    template: string,
    vars: Record<string, string | number>
  ): string {
    let s = template;
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
    return s;
  }
  const [inputType, setInputType] = useState<InputType>("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "linkedin",
    "twitter_thread",
    "twitter_single",
    "instagram",
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
  /** null until first /api/me — avoids treating paid users as free on first paint */
  const [plan, setPlan] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    count: number;
    limit: number | null;
    daysUntilReset: number;
  } | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [limitModalCode, setLimitModalCode] = useState<
    "LIMIT_REACHED" | "PLAN_LIMIT" | null
  >(null);
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
  const [profileSyncFailed, setProfileSyncFailed] = useState(false);

  const clearRepurposeResults = useCallback(() => {
    setOutputs([]);
    setBulkSources([]);
    setLastJobId(null);
    setPlatformFitScores([]);
    setPlatformFitLoading(false);
    setCopiedPlatform(null);
    setRegeneratingPlatform(null);
  }, []);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (prev === "/dashboard/history" && pathname === "/dashboard") {
      clearRepurposeResults();
    }
  }, [pathname, clearRepurposeResults]);

  const isFreePlan = plan === "free";
  const hasPaidPlan = plan !== null && plan !== "free";
  /** Native select while loading or on free tier (avoids Radix scroll-lock on some devices). */
  const useNativeBrandVoiceSelect = plan === null || plan === "free";

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

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as {
        plan?: string;
        repurposeCount?: number;
        repurposeLimit?: number | null;
        daysUntilUsageReset?: number;
        code?: string;
      };
      if (res.ok) {
        setProfileSyncFailed(false);
        setPlan(data.plan ?? "free");
        setUsage({
          count: data.repurposeCount ?? 0,
          limit:
            data.repurposeLimit === undefined ? null : data.repurposeLimit,
          daysUntilReset: data.daysUntilUsageReset ?? 0,
        });
      } else {
        if (data.code === "PROFILE_SYNC_FAILED") {
          setProfileSyncFailed(true);
        } else {
          setProfileSyncFailed(false);
          setPlan("free");
        }
      }
    } catch {
      setProfileSyncFailed(false);
      setPlan("free");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshMe();
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (params.get("upgraded") === "true") {
        await refreshMe();
        window.history.replaceState({}, "", window.location.pathname);
      }
    })();
  }, [refreshMe]);

  useEffect(() => {
    if (plan === "free") {
      setSelectedPlatforms((prev) =>
        prev.filter((p) => FREE_PLATFORMS_SET.has(p))
      );
    }
  }, [plan]);

  useEffect(() => {
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
  }, []);

  function togglePlatform(platform: Platform) {
    if (plan === "free" && !FREE_PLATFORMS_SET.has(platform)) return;
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
        toastT.error("toast.uploadPdfFirst");
        return;
      }
    } else if (inputType === "text" && !content.trim()) {
      toastT.error("toast.pasteContentFirst");
      return;
    }
    if (inputType === "youtube" && !url.trim()) {
      toastT.error("toast.enterUrl");
      return;
    }
    if (inputType === "url") {
      if (bulkMode) {
        const parsed = parseBulkUrls(bulkUrls);
        const valid = parsed.filter(isValidUrl);
        if (valid.length < 2 || valid.length > 5) {
          toastT.error("toast.enterBlogUrls");
          return;
        }
      } else if (!url.trim()) {
        toastT.error("toast.enterUrl");
        return;
      }
    }
    if (selectedPlatforms.length === 0) {
      toastT.error("toast.selectPlatform");
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
        if (data.code === "LIMIT_REACHED" || data.code === "PLAN_LIMIT") {
          setLimitModalCode(data.code);
          setLimitModalOpen(true);
          track(AnalyticsEvent.FREE_LIMIT_HIT, {
            code: data.code,
            plan: plan ?? "unknown",
          });
        }
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.genericError"
        );
        return;
      }
        await refreshMe();
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
        toastT.success("toast.generatedFromSources", {
          total: data.totalOutputs,
          sources: data.sources.length,
        });
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
                  : url,
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
        if (data.code === "LIMIT_REACHED" || data.code === "PLAN_LIMIT") {
          setLimitModalCode(data.code);
          setLimitModalOpen(true);
          track(AnalyticsEvent.FREE_LIMIT_HIT, {
            code: data.code,
            plan: plan ?? "unknown",
          });
        }
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.genericError"
        );
        return;
      }
        await refreshMe();
        setOutputs(data.outputs);
        setLastJobId(data.jobId ?? null);
        toastT.success("toast.generatedForPlatforms", {
          count: data.outputs.length,
        });
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
      toastT.error("toast.networkError");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(platform: string, text: string, copyKey?: string) {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(copyKey ?? platform);
    toastT.success("toast.copiedToClipboard");
    setTimeout(() => setCopiedPlatform(null), 2000);
  }

  async function handleRegenerate(platform: Platform) {
    if (!lastJobId) {
      toastT.error("toast.regenerateFirst");
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
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.regenerationFailed"
        );
        return;
      }
      setOutputs((prev) =>
        prev.map((o) =>
          o.platform === platform ? { ...o, content: data.content } : o
        )
      );
      toastT.success("toast.regenerated");
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setRegeneratingPlatform(null);
    }
  }

  function openScheduleModal(platform: Platform, jobId?: string) {
    const provider = platformProvider(platform);
    if (!provider) {
      const info = SUPPORTED_PLATFORMS.find((p) => p.id === platform);
      toastT.error("toast.postInAppNotSupported", {
        platform: info?.name ?? platform,
      });
      return;
    }
    const acc = connectedAccounts.find((a) => a.platform === provider);
    const jid = jobId ?? lastJobId;
    if (!acc) {
      toastT.error("toast.connectToSchedule", {
        provider: provider === "twitter" ? "Twitter/X" : "LinkedIn",
      });
      return;
    }
    if (!jid) {
      toastT.error("toast.cannotSchedule");
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
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.failedSchedule"
        );
        return;
      }
      toastT.success("toast.postScheduled");
      setScheduleOpen(false);
      setScheduleJobId(null);
    } catch {
      toastT.error("toast.networkErrorShort");
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
      toastT.error("toast.cannotPostRepurpose");
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
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.postFailed"
        );
        return;
      }
      toastT.success("toast.postedToPlatform", {
        platform: platform.includes("twitter") ? "X" : platform,
      });
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setPostingPlatform(null);
    }
  }

  async function handlePostAllConnected() {
    if (!hasPaidPlan) {
      toastT.error("toast.bulkPostProOnly");
      return;
    }
    if (!lastJobId) {
      toastT.error("toast.cannotPostRepurpose");
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
      toastT.error("toast.noConnectedBulk");
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
      toastT.success("toast.postedTo", { list: successes.join(", ") });
    }
    if (failures.length) {
      toastT.error("toast.failedOn", { list: failures.join(", ") });
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      <OnboardingBanner />
      {profileSyncFailed && (
        <div
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          role="alert"
        >
          <p className="text-sm text-foreground">{d.profileSyncBanner}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => void refreshMe()}
          >
            {d.profileSyncRetry}
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{d.title}</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {d.subtitle}
            </p>
        </div>
        {usage && (
          <div className="flex flex-col items-end gap-2 min-w-[200px] max-w-sm">
            <span className="text-sm text-muted-foreground text-right">
              {usage.limit != null
                ? df(d.usageLine, { count: usage.count, limit: usage.limit })
                : df(d.usageLineUnlimited, { count: usage.count })}
            </span>
            {usage.limit != null && (
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (usage.count / usage.limit) * 100)}%`,
                  }}
                />
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              {df(d.resetsInDays, { days: usage.daysUntilReset })}
            </span>
            {usage.limit != null &&
              usage.count >= Math.max(0, usage.limit - 2) && (
                <Link href="/#pricing">
                  <Button size="sm" variant="outline">
                    {d.upgrade}
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
              <p className="font-semibold">{d.contentAgentTitle}</p>
              <p className="text-sm text-muted-foreground">
                {d.contentAgentSubtitle}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{d.yourContent}</CardTitle>
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
                  <span className="hidden sm:inline">
                    {d.inputTabs[tab.id as keyof typeof d.inputTabs]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder={d.placeholderText}
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
                  {d.singleUrl}
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
                  {d.bulkUrls}
                </button>
              </div>
              {bulkMode ? (
                <div>
                  <Label htmlFor="bulk-urls">{d.bulkUrlsLabel}</Label>
                  <Textarea
                    id="bulk-urls"
                    placeholder={"https://example.com/post-1\nhttps://example.com/post-2\nhttps://example.com/post-3"}
                    className="min-h-[140px] mt-2 font-mono text-sm"
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {df(d.bulkUrlsHint, {
                      platforms: selectedPlatforms.length,
                      max: selectedPlatforms.length * 5,
                    })}
                  </p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="blog-url">{d.blogUrlLabel}</Label>
                  <Input
                    id="blog-url"
                    type="url"
                    placeholder="https://example.com/my-blog-post"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {d.blogUrlHint}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="youtube" className="mt-4 space-y-3">
              <div>
                <Label htmlFor="yt-url">{d.youtubeLabel}</Label>
                <Input
                  id="yt-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {d.youtubeHint}
                </p>
              </div>
              <Link href="/dashboard/clips" className="block">
                <p className="text-sm text-primary hover:underline flex items-center gap-1.5">
                  <Scissors className="h-4 w-4" />
                  {d.clipsLink}
                </p>
              </Link>
            </TabsContent>

            <TabsContent value="pdf" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <Label htmlFor="pdf-upload" className="cursor-pointer block">
                  <div className="text-center py-4">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      {pdfFileName ? pdfFileName : d.pdfUpload}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.pdfHint}
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
                      let data: { error?: string; code?: string; text?: string };
                      try {
                        data = await res.json();
                      } catch {
                        toastT.error("toast.invalidServerResponse");
                        return;
                      }
                      if (!res.ok) {
                        toastT.errorFromApi(
                          { error: data.error, code: data.code },
                          "toast.failedExtractPdf"
                        );
                        return;
                      }
                      setPdfFileName(file.name);
                      setPdfExtractedText(data.text ?? "");
                      toastT.success("toast.pdfExtracted");
                    } catch (err) {
                      if (err instanceof Error && err.message) {
                        toastT.errorFromApi({ error: err.message });
                      } else {
                        toastT.error("toast.failedProcessPdf");
                      }
                    } finally {
                      setPdfExtracting(false);
                      e.target.value = "";
                    }
                  }}
                />
                {pdfExtractedText && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {df(d.pdfChars, { count: pdfExtractedText.length })}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Brand voice: native select on free plan (avoids Radix scroll-lock on some devices). */}
      <Card>
          <CardHeader>
            <CardTitle className="text-lg">{d.brandVoiceCardTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {useNativeBrandVoiceSelect
                ? d.freeBrandVoiceCardSubtitle
                : d.brandVoiceCardSubtitle}
            </p>
          </CardHeader>
          <CardContent>
            {useNativeBrandVoiceSelect ? (
              <select
                id="brand-voice-select-free"
                className={cn(
                  "flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-xs",
                  "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                )}
                value={brandVoiceId || "none"}
                onChange={(e) =>
                  setBrandVoiceId(e.target.value === "none" ? "" : e.target.value)
                }
                aria-label={d.brandVoiceCardTitle}
              >
                <option value="none">{d.noBrandVoice}</option>
                {brandVoices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            ) : (
              <Select
                value={brandVoiceId || "none"}
                onValueChange={(v) => setBrandVoiceId(v === "none" ? "" : v)}
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder={d.noBrandVoice} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{d.noBrandVoice}</SelectItem>
                  {brandVoices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              <Link
                href="/dashboard/brand-voice"
                className="font-medium text-primary hover:underline"
              >
                {d.addVoiceLink}
              </Link>
              {" "}
              {d.addVoiceSuffix}
            </p>
          </CardContent>
        </Card>

      {/* Platform Selection — touch-optimized (min 44px tap targets) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{d.outputPlatformsTitle}</CardTitle>
          {isFreePlan && (
            <p className="text-xs sm:text-sm text-muted-foreground">
              {d.freePlanPlatformsBefore}{" "}
              <Link href="/#pricing" className="text-primary hover:underline">
                {d.freePlanPlatformsLink}
              </Link>{" "}
              {d.freePlanPlatformsAfter}
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
                  title={isLocked ? d.platformLockTitle : undefined}
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
          <CardTitle className="text-lg">{d.generateAsTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {d.generateAsSubtitle}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">{d.contentAngleLabel}</Label>
              <Select value={contentAngle} onValueChange={setContentAngle}>
                <SelectTrigger className="w-full min-h-[44px] mt-1">
                  <SelectValue placeholder={d.selectAngle} />
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
              <Label className="text-xs text-muted-foreground">{d.hookModeLabel}</Label>
              <Select value={hookMode} onValueChange={setHookMode}>
                <SelectTrigger className="w-full min-h-[44px] mt-1">
                  <SelectValue placeholder={d.selectHook} />
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
          <CardTitle className="text-lg">{d.outputLanguageTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select
              value={outputLanguage}
              onValueChange={(v) => setOutputLanguage(v as OutputLanguage)}
            >
              <SelectTrigger className="w-full sm:w-[220px] min-h-[44px]">
                <SelectValue placeholder={d.selectLanguage} />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id} lang={lang.id}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span
                        lang={lang.id}
                        className="font-native-script text-muted-foreground text-xs"
                      >
                        ({lang.nativeName})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {
                d.outputLangHint[
                  outputLanguage as keyof typeof d.outputLangHint
                ]
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What you want — optional intent */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{d.intentTitle}</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            {d.intentSubtitle}
          </p>
        </CardHeader>
        <CardContent>
          <Input
            placeholder={d.intentPlaceholder}
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
        {d.infoSerious}
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
              ? df(d.generatingBulk, {
                  sources: parseBulkUrls(bulkUrls).filter(isValidUrl).length,
                  platforms: selectedPlatforms.length,
                })
              : df(d.generatingSingle, {
                  platforms: selectedPlatforms.length,
                })}
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5 mr-2" />
            {inputType === "url" && bulkMode
              ? df(d.repurposeBulk, { platforms: selectedPlatforms.length })
              : df(d.repurposeSingle, {
                  platforms: selectedPlatforms.length,
                })}
          </>
        )}
      </Button>

      {/* Output Section — single column on mobile */}
      {(outputs.length > 0 || bulkSources.length > 0) && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {d.generatedIntro}
            {isFreePlan && (
              <span className="block mt-1 text-xs">
                {d.watermarkNote}{" "}
                <Link href="/pricing" className="text-primary hover:underline">
                  {d.upgradeLink}
                </Link>{" "}
                {d.watermarkNoteAfter}
              </span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold">{d.generatedHeading}</h2>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
                onClick={clearRepurposeResults}
              >
                {d.clearResults}
              </Button>
            </div>
            {hasPaidPlan && bulkSources.length === 0 && (
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
                      {d.postingAll}
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      {d.postAllConnected}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">{d.postAllHint}</p>
              </div>
            )}
          </div>
          {/* Where to Post — platform fit scorecard (single repurpose only) */}
          {outputs.length > 0 && bulkSources.length === 0 && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  {d.platformFitTitle}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {d.platformFitSubtitle}
                </p>
              </CardHeader>
              <CardContent>
                {platformFitLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {d.analyzingFit}
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
                                {isPost
                                  ? d.platformFitRecPost
                                  : isSkip
                                    ? d.platformFitRecSkip
                                    : d.platformFitRecConsider}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {platformFitScores.some((s) => s.recommendation === "skip") && (
                      <p className="text-xs text-muted-foreground">
                        {d.platformFitTip}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2">{d.platformFitUnavailable}</p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-8">
            {bulkSources.length > 0 ? (
              bulkSources.map((source, idx) => (
                <div key={source.jobId} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {df(d.sourceBanner, { index: idx + 1 })}
                    </span>
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate max-w-md"
                    >
                      {source.sourceUrl}
                    </a>
                    {hasPaidPlan && (
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
                          if (successes.length) {
                            toastT.success("toast.postedTo", {
                              list: successes.join(", "),
                            });
                          }
                          if (failures.length) {
                            toastT.error("toast.failedPartial", {
                              list: failures.join(", "),
                            });
                          }
                        }}
                        disabled={bulkPosting}
                      >
                        {d.postThisSource}
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
                                      title={
                                        !account
                                          ? df(d.connectProvider, {
                                              provider: providerLabel(provider),
                                            })
                                          : undefined
                                      }
                                    >
                                      {postingPlatform === output.platform ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <>
                                          <Send className="h-3.5 w-3.5 mr-1" /> {d.postNow}
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="min-h-[40px] touch-manipulation"
                                      onClick={() => openScheduleModal(output.platform, source.jobId)}
                                      disabled={scheduleSubmitting}
                                      title={
                                        !account
                                          ? df(d.connectToScheduleTitle, {
                                              provider: providerLabel(provider),
                                            })
                                          : undefined
                                      }
                                    >
                                      <CalendarClock className="h-3.5 w-3.5 mr-1" />
                                      {d.schedule}
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="min-h-[40px] touch-manipulation"
                                  onClick={() => handleCopy(output.platform, output.content, `${source.jobId}-${output.platform}`)}
                                >
                                  {copiedPlatform === `${source.jobId}-${output.platform}` ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 mr-1" /> {d.copied}
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5 mr-1" /> {d.copy}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="bg-muted/50 rounded-lg p-4 text-sm font-sans whitespace-pre-wrap max-h-80 overflow-y-auto">
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
                              title={
                                !account && provider
                                  ? df(d.connectToPostTitle, {
                                      provider: providerLabel(provider),
                                    })
                                  : undefined
                              }
                            >
                              {postingPlatform === output.platform ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5 mr-1" />
                                  {d.postNow}
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-[40px] touch-manipulation"
                              onClick={() => openScheduleModal(output.platform)}
                              disabled={scheduleSubmitting}
                              title={
                                !account && provider
                                  ? df(d.connectToScheduleTitle, {
                                      provider: providerLabel(provider),
                                    })
                                  : undefined
                              }
                            >
                              <CalendarClock className="h-3.5 w-3.5 mr-1" />
                              {d.schedule}
                            </Button>
                            {!account && provider && (
                              <Link
                                href="/dashboard/connections"
                                className="text-xs text-primary hover:underline font-medium"
                              >
                                {df(d.connectProvider, {
                                  provider: providerLabel(provider),
                                })}
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
                              {d.regenerate}
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
                              {d.copied}
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              {d.copy}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="bg-muted/50 rounded-lg p-4 text-sm font-sans whitespace-pre-wrap max-h-80 overflow-y-auto">
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
            <DialogTitle>{d.scheduleDialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">{d.scheduleDateTime}</label>
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
              {d.dialogCancel}
            </Button>
            <Button
              onClick={handleScheduleSubmit}
              disabled={scheduleSubmitting}
            >
              {scheduleSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                d.schedule
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {limitModalCode === "PLAN_LIMIT"
                ? d.limitModalTitlePlatform
                : d.limitModalTitleLimit}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {limitModalCode === "PLAN_LIMIT"
              ? d.limitModalBodyPlatform
              : d.limitModalBodyLimit}
          </p>
          <p className="text-sm">{d.limitModalCompare}</p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLimitModalOpen(false)}>
              {d.dialogCancel}
            </Button>
            <Button asChild>
              <Link href="/#pricing">{d.limitModalCta}</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
