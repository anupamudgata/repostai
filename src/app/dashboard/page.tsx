"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const OnboardingBanner = dynamic(
  () => import("@/components/dashboard/OnboardingBanner"),
  { ssr: false }
);
import {
  Loader2,
  RefreshCw,
  Send,
  Bot,
  ChevronRight,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/config/constants";
import { charDf as dfChar } from "@/components/dashboard/repurpose/character-count";
import { PlatformPicker } from "@/components/dashboard/repurpose/platform-picker";
import { GenerationPreviewStrip } from "@/components/dashboard/repurpose/generation-preview-strip";
import { SourceInputPanel } from "@/components/dashboard/repurpose/source-input-panel";
import {
  QualityReadinessPanel,
  buildReadinessItems,
} from "@/components/dashboard/repurpose/quality-readiness-panel";
import { WorkspaceHeader } from "@/components/dashboard/repurpose/workspace-header";
import { WorkspaceSettingsRail } from "@/components/dashboard/repurpose/workspace-settings-rail";
import {
  OutputAssetCard,
  type RefineIntent,
} from "@/components/dashboard/repurpose/output-asset-card";

const FREE_PLATFORMS_SET = new Set<string>(FREE_PLATFORM_IDS);

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

  const df = dfChar;
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
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);
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
  const [refiningKey, setRefiningKey] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const clearRepurposeResults = useCallback(() => {
    setOutputs([]);
    setBulkSources([]);
    setLastJobId(null);
    setPlatformFitScores([]);
    setPlatformFitLoading(false);
    setCopiedPlatform(null);
    setRegeneratingKey(null);
  }, []);

  const handleStartNew = useCallback(() => {
    setOutputs([]);
    setBulkSources([]);
    setLastJobId(null);
    setPlatformFitScores([]);
    setPlatformFitLoading(false);
    setCopiedPlatform(null);
    setRegeneratingKey(null);
    setContent("");
    setUrl("");
    setBulkUrls("");
    setPdfFileName("");
    setPdfExtractedText("");
    setUserIntent("");
    setInputType("text");
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  /** Always use native select for brand voice — avoids Radix scroll-lock freezing the page. */
  const useNativeBrandVoiceSelect = true;

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

  async function handleRegenerate(platform: Platform, jobId?: string) {
    const jid = jobId ?? lastJobId;
    if (!jid) {
      toastT.error("toast.regenerateFirst");
      return;
    }
    const rk = `${jid}-${platform}`;
    setRegeneratingKey(rk);
    try {
      const res = await fetch("/api/repurpose/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jid, platform }),
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
      setBulkSources((prev) =>
        prev.map((src) =>
          src.jobId !== jid
            ? src
            : {
                ...src,
                outputs: src.outputs.map((o) =>
                  o.platform === platform ? { ...o, content: data.content } : o
                ),
              }
        )
      );
      toastT.success("toast.regenerated");
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setRegeneratingKey(null);
    }
  }

  async function handleRefine(
    platform: Platform,
    intent: RefineIntent,
    jobId?: string
  ) {
    const jid = jobId ?? lastJobId;
    if (!jid) {
      toastT.error("toast.regenerateFirst");
      return;
    }
    const key = `${jid}-${platform}-${intent}`;
    setRefiningKey(key);
    try {
      const res = await fetch("/api/repurpose/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jid,
          platform,
          refineIntent: intent,
        }),
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
      setBulkSources((prev) =>
        prev.map((src) =>
          src.jobId !== jid
            ? src
            : {
                ...src,
                outputs: src.outputs.map((o) =>
                  o.platform === platform ? { ...o, content: data.content } : o
                ),
              }
        )
      );
      toastT.success("toast.regenerated");
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setRefiningKey(null);
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

  const limitReached =
    !!usage && usage.limit != null && usage.count >= usage.limit;

  const readinessItems = useMemo(
    () =>
      buildReadinessItems(d, {
        inputType,
        content,
        url,
        bulkUrls,
        bulkMode,
        pdfExtractedText,
        selectedCount: selectedPlatforms.length,
        limitReached,
        isValidUrl,
        parseBulkUrls,
      }),
    [
      d,
      inputType,
      content,
      url,
      bulkUrls,
      bulkMode,
      pdfExtractedText,
      selectedPlatforms.length,
      limitReached,
    ]
  );

  const canGenerate = readinessItems.every((i) => i.ok);

  return (
    <div ref={topRef} className="pb-10">
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

      <div className="flex flex-col xl:flex-row gap-8 xl:items-start mt-6">
        <div className="flex-1 min-w-0 space-y-8">
          <WorkspaceHeader
            d={d}
            df={df}
            usage={usage}
            loading={loading}
            generateDisabled={!canGenerate}
            onGenerate={handleRepurpose}
            bulkMode={bulkMode}
            inputType={inputType}
            bulkUrlCount={parseBulkUrls(bulkUrls).filter(isValidUrl).length}
            selectedPlatformCount={selectedPlatforms.length}
          />

      {/* Content Agent CTA */}
      <Link href="/dashboard/agent">
        <div className="agent-cta-card rounded-xl border border-border/60 bg-card px-4 py-3 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg icon-gradient-purple flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{d.contentAgentTitle}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              {d.contentAgentSubtitle}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Link>

      <SourceInputPanel
        d={d}
        df={df}
        toastT={toastT}
        inputType={inputType}
        setInputType={setInputType}
        content={content}
        setContent={setContent}
        url={url}
        setUrl={setUrl}
        bulkMode={bulkMode}
        setBulkMode={setBulkMode}
        bulkUrls={bulkUrls}
        setBulkUrls={setBulkUrls}
        selectedPlatformCount={selectedPlatforms.length}
        pdfExtracting={pdfExtracting}
        setPdfExtracting={setPdfExtracting}
        pdfFileName={pdfFileName}
        setPdfFileName={setPdfFileName}
        pdfExtractedText={pdfExtractedText}
        setPdfExtractedText={setPdfExtractedText}
      />

      {/* Destinations — grouped platforms */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">
          {d.outputPlatformsTitle}
        </h2>
        <PlatformPicker
          d={d}
          isFreePlan={isFreePlan}
          freePlatformSet={FREE_PLATFORMS_SET}
          selectedPlatforms={selectedPlatforms}
          onToggle={togglePlatform}
        />
      </section>

      <GenerationPreviewStrip
        d={d}
        df={df}
        selectedPlatforms={selectedPlatforms}
        bulkMode={bulkMode}
        inputType={inputType}
        bulkUrlCount={parseBulkUrls(bulkUrls).filter(isValidUrl).length}
      />

      {!loading &&
        outputs.length === 0 &&
        bulkSources.length === 0 && (
          <div
            className="rounded-xl border border-dashed border-primary/20 bg-primary/3 px-5 py-12 text-center space-y-2"
            aria-live="polite"
          >
            <div className="h-10 w-10 rounded-full icon-gradient-purple flex items-center justify-center mx-auto mb-3">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {d.emptyCanvasTitle}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {d.emptyCanvasBody}
            </p>
          </div>
        )}

      {loading && outputs.length === 0 && bulkSources.length === 0 && (
        <div
          className="rounded-xl border border-primary/20 bg-primary/4 px-5 py-12 flex flex-col items-center gap-3"
          aria-busy="true"
        >
          <div className="relative">
            <div className="h-12 w-12 rounded-full icon-gradient-purple flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">{d.repurposeLoading}</p>
          <p className="text-xs text-muted-foreground">This usually takes 10–20 seconds</p>
        </div>
      )}

        </div>

        <aside className="w-full xl:w-[min(100%,340px)] shrink-0 space-y-5 xl:sticky xl:top-4 xl:self-start">
          <QualityReadinessPanel d={d} items={readinessItems} />
          <WorkspaceSettingsRail
            d={d}
            useNativeBrandVoiceSelect={useNativeBrandVoiceSelect}
            brandVoiceId={brandVoiceId}
            setBrandVoiceId={setBrandVoiceId}
            brandVoices={brandVoices}
            outputLanguage={outputLanguage}
            setOutputLanguage={setOutputLanguage}
            contentAngle={contentAngle}
            setContentAngle={setContentAngle}
            hookMode={hookMode}
            setHookMode={setHookMode}
            userIntent={userIntent}
            setUserIntent={setUserIntent}
          />
        </aside>
      </div>

      {/* Output Section — full width below workspace + rail */}
      {(outputs.length > 0 || bulkSources.length > 0) && (
        <div className="mt-10 space-y-4 animate-page-in">
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
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                  {d.assetsHeading}
                </h2>
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

            {/* Quick action bar — change language or start fresh without scrolling */}
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm px-3 py-2.5 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                {d.quickRegenerateInLabel}
              </span>
              <Select
                value={outputLanguage}
                onValueChange={(v) => setOutputLanguage(v as OutputLanguage)}
              >
                <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id} lang={lang.id} className="text-xs">
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="default"
                className="h-8 text-xs px-3 gap-1.5 font-semibold"
                onClick={handleRepurpose}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {d.quickRegenerateBtn}
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs px-3 gap-1.5 border-border/60"
                onClick={handleStartNew}
              >
                + {d.quickNewPostBtn}
              </Button>
            </div>
          </div>
          {/* Where to Post — platform fit scorecard (single repurpose only) */}
          {outputs.length > 0 && bulkSources.length === 0 && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/6 to-transparent shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 font-bold">
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
                      const platformInfo = SUPPORTED_PLATFORMS.find(
                        (p) => p.id === output.platform
                      );
                      const provider = platformProvider(output.platform);
                      const account = provider
                        ? connectedAccounts.find((a) => a.platform === provider)
                        : null;
                      const copyKey = `${source.jobId}-${output.platform}`;
                      const scopeId = source.jobId;
                      return (
                        <OutputAssetCard
                          key={output.platform}
                          d={d}
                          output={output}
                          platformName={platformInfo?.name ?? output.platform}
                          maxLength={platformInfo?.maxLength ?? null}
                          provider={provider}
                          account={account ?? undefined}
                          copied={copiedPlatform === copyKey}
                          regenerating={
                            regeneratingKey === `${scopeId}-${output.platform}`
                          }
                          refineBusyKey={refiningKey}
                          refineScopeId={scopeId}
                          posting={postingPlatform === output.platform}
                          bulkPosting={bulkPosting}
                          scheduleSubmitting={scheduleSubmitting}
                          onCopy={() =>
                            handleCopy(output.platform, output.content, copyKey)
                          }
                          onRegenerate={() =>
                            handleRegenerate(output.platform, source.jobId)
                          }
                          onRefine={(intent) =>
                            handleRefine(output.platform, intent, source.jobId)
                          }
                          onPostNow={() =>
                            account &&
                            handlePostNow(
                              output.platform,
                              account.id,
                              source.jobId
                            )
                          }
                          onSchedule={() =>
                            openScheduleModal(output.platform, source.jobId)
                          }
                          connectHref={
                            !account && provider
                              ? "/dashboard/connections"
                              : undefined
                          }
                          connectLabel={
                            !account && provider
                              ? df(d.connectProvider, {
                                  provider: providerLabel(provider),
                                })
                              : undefined
                          }
                        />
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
                  const scopeId = lastJobId ?? "";
                  return (
                    <OutputAssetCard
                      key={output.platform}
                      d={d}
                      output={output}
                      platformName={platformInfo?.name ?? output.platform}
                      maxLength={platformInfo?.maxLength ?? null}
                      provider={provider}
                      account={account ?? undefined}
                      copied={copiedPlatform === output.platform}
                      regenerating={
                        regeneratingKey === `${scopeId}-${output.platform}`
                      }
                      refineBusyKey={refiningKey}
                      refineScopeId={scopeId}
                      posting={postingPlatform === output.platform}
                      bulkPosting={bulkPosting}
                      scheduleSubmitting={scheduleSubmitting}
                      onCopy={() =>
                        handleCopy(output.platform, output.content)
                      }
                      onRegenerate={() => handleRegenerate(output.platform)}
                      onRefine={(intent) =>
                        handleRefine(output.platform, intent)
                      }
                      onPostNow={() =>
                        account &&
                        handlePostNow(output.platform, account.id)
                      }
                      onSchedule={() => openScheduleModal(output.platform)}
                      connectHref={
                        !account && provider
                          ? "/dashboard/connections"
                          : undefined
                      }
                      connectLabel={
                        !account && provider
                          ? df(d.connectProvider, {
                              provider: providerLabel(provider),
                            })
                          : undefined
                      }
                    />
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
