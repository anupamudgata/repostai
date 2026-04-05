"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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
  Copy,
  Check,
  HelpCircle,
  FileDown,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  GenerationPreviewStrip,
  PlatformsGeneratedBadge,
} from "@/components/dashboard/repurpose/generation-preview-strip";
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
import { FirstRepurposeConfetti } from "@/components/dashboard/first-repurpose-confetti";

const FREE_PLATFORMS_SET = new Set<string>(FREE_PLATFORM_IDS);

const FIRST_REPURPOSE_LS_KEY = "repostai_first_repurpose_done";
const TOTAL_REPURPOSE_COUNT_KEY = "repostai_total_repurpose_count";

function readStoredRepurposeTotal(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(TOTAL_REPURPOSE_COUNT_KEY);
    if (raw == null || raw === "") return 0;
    try {
      const v = JSON.parse(raw) as unknown;
      if (typeof v === "number" && Number.isFinite(v)) {
        return Math.max(0, Math.floor(v));
      }
    } catch {
      /* use numeric parse */
    }
    const n = parseInt(String(raw), 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  } catch {
    return 0;
  }
}

function incrementStoredRepurposeTotal(): number {
  const next = readStoredRepurposeTotal() + 1;
  try {
    localStorage.setItem(TOTAL_REPURPOSE_COUNT_KEY, JSON.stringify(next));
  } catch {
    try {
      localStorage.setItem(TOTAL_REPURPOSE_COUNT_KEY, String(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

function tryTriggerFirstRepurposeConfetti(setVisible: (v: boolean) => void) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(FIRST_REPURPOSE_LS_KEY)) return;
    localStorage.setItem(FIRST_REPURPOSE_LS_KEY, "1");
    setVisible(true);
  } catch {
    /* quota / private mode */
  }
}

function countNonEmptyPlatformOutputs(
  outputs: { content: string }[]
): number {
  return outputs.filter((o) => String(o.content ?? "").trim().length > 0)
    .length;
}

function sortOutputsByOrder<T extends { platform: Platform }>(
  list: T[],
  order: Platform[]
): T[] {
  const m = new Map(list.map((o) => [o.platform, o] as const));
  const out: T[] = [];
  for (const p of order) {
    const item = m.get(p);
    if (item) out.push(item);
  }
  return out;
}

function movePlatformInOrder(
  order: Platform[],
  platform: Platform,
  delta: number
): Platform[] {
  const i = order.indexOf(platform);
  if (i < 0) return order;
  const j = i + delta;
  if (j < 0 || j >= order.length) return order;
  const next = [...order];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const RECENT_URLS_LS_KEY = "repostai_recent_urls";

function pushRecentSingleUrlEntry(href: string) {
  const u = href.trim();
  if (!u) return;
  try {
    const raw = localStorage.getItem(RECENT_URLS_LS_KEY);
    let prev: string[] = [];
    if (raw) {
      try {
        const j = JSON.parse(raw) as unknown;
        if (Array.isArray(j)) {
          prev = j.filter((x): x is string => typeof x === "string");
        }
      } catch {
        prev = [];
      }
    }
    const next = [u, ...prev.filter((x) => x !== u)].slice(0, 5);
    localStorage.setItem(RECENT_URLS_LS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

/** Retries for /api/me after OAuth redirect or cold start (transient PROFILE_SYNC_FAILED). */
const ME_FETCH_ATTEMPTS = 3;
const ME_RETRY_DELAY_MS = 500;

export default function DashboardPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [tonePreset, setTonePreset] = useState<string>("casual");
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
  const [copyAllCopied, setCopyAllCopied] = useState(false);
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
  const [schedulePreviewText, setSchedulePreviewText] = useState("");
  const [scheduleDialogTab, setScheduleDialogTab] = useState<
    "schedule" | "preview"
  >("schedule");
  const [outputCardOrder, setOutputCardOrder] = useState<Platform[]>([]);
  const [bulkCardOrderByJob, setBulkCardOrderByJob] = useState<
    Record<string, Platform[]>
  >({});
  const [shortcutsPopoverOpen, setShortcutsPopoverOpen] = useState(false);
  const [isMacPlatform, setIsMacPlatform] = useState(false);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [pdfExtractedText, setPdfExtractedText] = useState<string>("");
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [recentUrlsRevision, setRecentUrlsRevision] = useState(0);
  const [bulkProgressSourceIdx, setBulkProgressSourceIdx] = useState(1);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkSources, setBulkSources] = useState<
    { sourceUrl: string; jobId: string; outputs: { platform: Platform; content: string }[] }[]
  >([]);
  const [platformFitScores, setPlatformFitScores] = useState<
    { platform: string; score: number; reason: string; recommendation: "post" | "consider" | "skip" }[]
  >([]);
  const [platformFitLoading, setPlatformFitLoading] = useState(false);
  /** loading = first fetch or retry in flight; ready = got 200 or non-profile error; error = profile sync failed after retries */
  const [meFetchState, setMeFetchState] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [profileSyncFailed, setProfileSyncFailed] = useState(false);
  const [refiningKey, setRefiningKey] = useState<string | null>(null);
  const [showFirstRepurposeConfetti, setShowFirstRepurposeConfetti] =
    useState(false);

  const dismissFirstRepurposeConfetti = useCallback(() => {
    setShowFirstRepurposeConfetti(false);
  }, []);

  const topRef = useRef<HTMLDivElement>(null);
  const outputSectionRef = useRef<HTMLDivElement>(null);

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

  /** Until /api/me completes, assume free limits so paid users briefly see stricter UI, not the reverse. */
  const isFreePlan = meFetchState === "loading" ? true : plan === "free";
  const hasPaidPlan =
    meFetchState === "ready" && plan !== null && plan !== "free";
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("repostai_default_language");
      if (!raw) return;
      if (SUPPORTED_LANGUAGES.some((l) => l.id === raw)) {
        setOutputLanguage(raw as OutputLanguage);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setIsMacPlatform(
      typeof navigator !== "undefined" &&
        /Mac|iPhone|iPod|iPad/i.test(
          navigator.platform || navigator.userAgent || ""
        )
    );
  }, []);

  useEffect(() => {
    const ids = outputs.map((o) => o.platform);
    if (ids.length === 0) {
      setOutputCardOrder([]);
      return;
    }
    setOutputCardOrder((prev) => {
      if (prev.length === 0) return ids;
      const same =
        ids.length === prev.length && ids.every((id) => prev.includes(id));
      return same ? prev : ids;
    });
  }, [outputs]);

  useEffect(() => {
    setBulkCardOrderByJob((prev) => {
      const next: Record<string, Platform[]> = { ...prev };
      for (const src of bulkSources) {
        const ids = src.outputs.map((o) => o.platform);
        const cur = next[src.jobId];
        const same =
          cur &&
          ids.length === cur.length &&
          ids.every((id) => cur.includes(id));
        next[src.jobId] = same ? cur : ids;
      }
      for (const k of Object.keys(next)) {
        if (!bulkSources.some((s) => s.jobId === k)) delete next[k];
      }
      return next;
    });
  }, [bulkSources]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isQuestion = e.key === "?" || (e.shiftKey && e.key === "/");
      if (!isQuestion) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest?.("input, textarea, [contenteditable='true']")) return;
      e.preventDefault();
      setShortcutsPopoverOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const el = e.target as HTMLElement | null;
      if (
        el?.closest?.(
          "[data-slot='dialog-content'], [data-slot='popover-content'], [role='dialog']"
        )
      )
        return;
      setContent("");
      setUrl("");
      setBulkUrls("");
      setPdfExtractedText("");
      setPdfFileName("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const refreshMe = useCallback(async () => {
    setMeFetchState("loading");
    setProfileSyncFailed(false);

    const applyOk = (data: {
      plan?: string;
      repurposeCount?: number;
      repurposeLimit?: number | null;
      daysUntilUsageReset?: number;
    }) => {
      setMeFetchState("ready");
      setProfileSyncFailed(false);
      setPlan(data.plan ?? "free");
      setUsage({
        count: data.repurposeCount ?? 0,
        limit:
          data.repurposeLimit === undefined ? null : data.repurposeLimit,
        daysUntilReset: data.daysUntilUsageReset ?? 0,
      });
    };

    try {
      for (let attempt = 0; attempt < ME_FETCH_ATTEMPTS; attempt++) {
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as {
          plan?: string;
          repurposeCount?: number;
          repurposeLimit?: number | null;
          daysUntilUsageReset?: number;
          code?: string;
          profileReady?: boolean;
        };

        if (res.ok) {
          applyOk(data);
          return;
        }

        const isProfileSync =
          res.status === 503 && data.code === "PROFILE_SYNC_FAILED";
        if (isProfileSync && attempt < ME_FETCH_ATTEMPTS - 1) {
          await new Promise((r) => setTimeout(r, ME_RETRY_DELAY_MS));
          continue;
        }
        if (isProfileSync) {
          setMeFetchState("error");
          setProfileSyncFailed(true);
          return;
        }

        setMeFetchState("ready");
        setProfileSyncFailed(false);
        setPlan("free");
        setUsage({
          count: 0,
          limit: null,
          daysUntilReset: 0,
        });
        return;
      }
    } catch {
      try {
        await new Promise((r) => setTimeout(r, ME_RETRY_DELAY_MS));
        const res = await fetch("/api/me", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as {
          plan?: string;
          repurposeCount?: number;
          repurposeLimit?: number | null;
          daysUntilUsageReset?: number;
          code?: string;
        };
        if (res.ok) {
          applyOk(data);
          return;
        }
      } catch {
        /* fall through */
      }
      setMeFetchState("ready");
      setProfileSyncFailed(false);
      setPlan("free");
      setUsage({
        count: 0,
        limit: null,
        daysUntilReset: 0,
      });
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshMe();
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const razorpayStatus = params.get("razorpay");
      if (params.get("upgraded") === "true") {
        await refreshMe();
        toastT.success("toast.upgradeSuccess");
        window.history.replaceState({}, "", window.location.pathname);
      } else if (razorpayStatus === "error") {
        toastT.error("toast.paymentError");
        window.history.replaceState({}, "", window.location.pathname);
      } else if (razorpayStatus === "missing" || razorpayStatus === "invalid") {
        toastT.error("toast.paymentVerifyFailed");
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

  useEffect(() => {
    if (!searchParams.get("prefill")) return;
    let text = "";
    try { text = sessionStorage.getItem("repostai_prefill") ?? ""; sessionStorage.removeItem("repostai_prefill"); } catch {}
    if (!text.trim()) { router.replace(pathname, { scroll: false }); return; }
    const lower = text.toLowerCase();
    if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
      setInputType("youtube");
      setUrl(text);
      setContent("");
    } else if (/^https?:\/\//i.test(text)) {
      setInputType("url");
      setUrl(text);
      setContent("");
    } else {
      setInputType("text");
      setContent(text);
      setUrl("");
    }
    router.replace(pathname, { scroll: false });
  }, [searchParams, router, pathname]);

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

    if (inputType === "url" && !bulkMode && url.trim()) {
      pushRecentSingleUrlEntry(url);
      setRecentUrlsRevision((n) => n + 1);
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
          tonePreset: tonePreset !== "casual" ? tonePreset : undefined,
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
        const mappedSources = data.sources.map(
          (s: {
            sourceUrl: string;
            jobId: string;
            outputs: { platform: string; content: string }[];
          }) => ({
            sourceUrl: s.sourceUrl,
            jobId: s.jobId,
            outputs: s.outputs.map((o: { platform: string; content: string }) => ({
              platform: o.platform as Platform,
              content: o.content,
            })),
          })
        );
        setBulkSources(mappedSources);
        setLastJobId(data.sources?.[data.sources.length - 1]?.jobId ?? null);
        const nonEmptyTotal = mappedSources.reduce(
          (
            acc: number,
            s: { outputs: { platform: Platform; content: string }[] }
          ) => acc + countNonEmptyPlatformOutputs(s.outputs),
          0
        );
        toastT.success("toast.repurposedToPlatforms", {
          count: nonEmptyTotal,
        });
        tryTriggerFirstRepurposeConfetti(setShowFirstRepurposeConfetti);
        const totalN = incrementStoredRepurposeTotal();
        if (totalN === 5 || totalN === 10 || totalN === 25) {
          toastT.success("toast.repurposeMilestone", { count: totalN });
        }
        window.setTimeout(() => {
          outputSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 80);
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
          tonePreset: tonePreset !== "casual" ? tonePreset : undefined,
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
        const mappedOutputs = (
          data.outputs as { platform: string; content: string }[]
        ).map((o) => ({
          platform: o.platform as Platform,
          content: o.content,
        }));
        setOutputs(mappedOutputs);
        setLastJobId(data.jobId ?? null);
        toastT.success("toast.repurposedToPlatforms", {
          count: countNonEmptyPlatformOutputs(mappedOutputs),
        });
        tryTriggerFirstRepurposeConfetti(setShowFirstRepurposeConfetti);
        const totalNSingle = incrementStoredRepurposeTotal();
        if (totalNSingle === 5 || totalNSingle === 10 || totalNSingle === 25) {
          toastT.success("toast.repurposeMilestone", { count: totalNSingle });
        }
        window.setTimeout(() => {
          outputSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 80);
        // Fetch platform fit analysis for single repurpose
        const outputsMap = mappedOutputs.reduce(
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

  async function handleCopyAllOutputs() {
    const texts: string[] = [];
    if (bulkSources.length > 0) {
      for (const src of bulkSources) {
        const ord =
          bulkCardOrderByJob[src.jobId] ??
          src.outputs.map((o) => o.platform);
        for (const o of sortOutputsByOrder(src.outputs, ord)) {
          const t = o.content.trim();
          if (t) texts.push(t);
        }
      }
    } else {
      for (const o of sortOutputsByOrder(outputs, outputCardOrder)) {
        const t = o.content.trim();
        if (t) texts.push(t);
      }
    }
    if (texts.length === 0) return;
    try {
      await navigator.clipboard.writeText(texts.join("\n\n---\n\n"));
      setCopyAllCopied(true);
      setTimeout(() => setCopyAllCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function handleExportOutputsTxt() {
    const sections: string[] = [];
    const pushOutput = (o: { platform: Platform; content: string }) => {
      const body = o.content.trim();
      if (!body) return;
      const name =
        SUPPORTED_PLATFORMS.find((p) => p.id === o.platform)?.name ??
        o.platform;
      sections.push(`=== ${name} ===\n${body}`);
    };
    if (bulkSources.length > 0) {
      for (const src of bulkSources) {
        const ord =
          bulkCardOrderByJob[src.jobId] ??
          src.outputs.map((o) => o.platform);
        for (const o of sortOutputsByOrder(src.outputs, ord)) {
          pushOutput(o);
        }
      }
    } else {
      for (const o of sortOutputsByOrder(outputs, outputCardOrder)) {
        pushOutput(o);
      }
    }
    if (sections.length === 0) return;
    const blob = new Blob([sections.join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    a.href = href;
    a.download = `repostai-${dateStr}.txt`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  async function handleRegenerate(
    platform: Platform,
    jobId?: string,
    instructionHint?: string
  ) {
    const jid = jobId ?? lastJobId;
    if (!jid) {
      toastT.error("toast.regenerateFirst");
      return;
    }
    const rk = `${jid}-${platform}`;
    setRegeneratingKey(rk);
    try {
      const hint = instructionHint?.trim();
      const res = await fetch("/api/repurpose/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jid,
          platform,
          outputLanguage,
          ...(hint ? { instructionHint: hint } : {}),
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
          outputLanguage,
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
    let preview = "";
    if (jobId) {
      const src = bulkSources.find((s) => s.jobId === jobId);
      preview =
        src?.outputs.find((o) => o.platform === platform)?.content ?? "";
    } else {
      preview = outputs.find((o) => o.platform === platform)?.content ?? "";
    }
    setSchedulePreviewText(preview);
    setScheduleDialogTab("schedule");
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

  const platformsGeneratedCount = useMemo(() => {
    if (bulkSources.length > 0) {
      return bulkSources.reduce(
        (acc, s) => acc + countNonEmptyPlatformOutputs(s.outputs),
        0
      );
    }
    return countNonEmptyPlatformOutputs(outputs);
  }, [bulkSources, outputs]);

  const orderedSingleOutputs = useMemo(
    () => sortOutputsByOrder(outputs, outputCardOrder),
    [outputs, outputCardOrder]
  );

  const bulkValidUrlCountForProgress = useMemo(() => {
    if (inputType !== "url" || !bulkMode) return 0;
    return parseBulkUrls(bulkUrls).filter(isValidUrl).length;
  }, [inputType, bulkMode, bulkUrls]);

  useEffect(() => {
    if (
      !loading ||
      inputType !== "url" ||
      !bulkMode ||
      bulkValidUrlCountForProgress < 1
    ) {
      setBulkProgressSourceIdx(1);
      return;
    }
    setBulkProgressSourceIdx(1);
    const id = window.setInterval(() => {
      setBulkProgressSourceIdx((i) =>
        i >= bulkValidUrlCountForProgress ? 1 : i + 1
      );
    }, 4000);
    return () => clearInterval(id);
  }, [loading, inputType, bulkMode, bulkValidUrlCountForProgress]);

  const bulkProgressHint =
    loading &&
    inputType === "url" &&
    bulkMode &&
    bulkValidUrlCountForProgress > 0
      ? df(d.bulkProcessingSource, {
          current: bulkProgressSourceIdx,
          total: bulkValidUrlCountForProgress,
        })
      : null;

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
    <div ref={topRef} className="pb-28 md:pb-10">
      <OnboardingBanner />
      {profileSyncFailed && meFetchState === "error" && (
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
            bulkProgressHint={bulkProgressHint}
            headerAccessory={
              <Popover
                open={shortcutsPopoverOpen}
                onOpenChange={setShortcutsPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-full border-border/60"
                    aria-label={d.keyboardShortcutsTitle}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 space-y-3">
                  <p className="text-sm font-semibold">{d.keyboardShortcutsTitle}</p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex justify-between gap-3">
                      <span>
                        {isMacPlatform ? "⌘" : "Ctrl"}+Enter
                      </span>
                      <span className="text-foreground font-medium text-right">
                        {d.shortcutRowGenerate}
                      </span>
                    </li>
                    <li className="flex justify-between gap-3">
                      <span>
                        {isMacPlatform ? "⌘" : "Ctrl"}+K
                      </span>
                      <span className="text-foreground font-medium text-right">
                        {d.shortcutRowFocusInput}
                      </span>
                    </li>
                    <li className="flex justify-between gap-3">
                      <span>Escape</span>
                      <span className="text-foreground font-medium text-right">
                        {d.shortcutRowClearInput}
                      </span>
                    </li>
                  </ul>
                  <p className="text-[10px] text-muted-foreground/80 border-t border-border/60 pt-2">
                    {d.keyboardShortcutsFooter}
                  </p>
                </PopoverContent>
              </Popover>
            }
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
        recentUrlsRevision={recentUrlsRevision}
      />

      {/* Destinations — grouped platforms */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground tracking-tight">
          {d.outputPlatformsTitle}
        </h2>
        <PlatformPicker
          d={d}
          df={df}
          isFreePlan={isFreePlan}
          freePlatformSet={FREE_PLATFORMS_SET}
          selectedPlatforms={selectedPlatforms}
          onToggle={togglePlatform}
          onReorder={setSelectedPlatforms}
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
            tonePreset={tonePreset}
            setTonePreset={setTonePreset}
          />
        </aside>
      </div>

      {/* Output Section — full width below workspace + rail */}
      {(outputs.length > 0 || bulkSources.length > 0) && (
        <div
          ref={outputSectionRef}
          className="mt-10 space-y-4 animate-page-in"
        >
          <div className="flex flex-wrap items-center gap-2">
            <PlatformsGeneratedBadge
              count={platformsGeneratedCount}
              label={df(d.platformsGeneratedBadge, {
                count: platformsGeneratedCount,
              })}
              df={df}
              d={d}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs shrink-0"
              onClick={() => void handleCopyAllOutputs()}
            >
              {copyAllCopied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {d.copyAllOutputs}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs shrink-0"
              onClick={handleExportOutputsTxt}
            >
              <FileDown className="h-3.5 w-3.5" />
              {d.exportOutputsTxt}
            </Button>
          </div>
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
                    {sortOutputsByOrder(
                      source.outputs,
                      bulkCardOrderByJob[source.jobId] ??
                        source.outputs.map((o) => o.platform)
                    ).map((output, cardIdx, list) => {
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
                          df={df}
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
                          onRegenerate={(hint) =>
                            handleRegenerate(output.platform, source.jobId, hint)
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
                          cardReorder={{
                            canUp: cardIdx > 0,
                            canDown: cardIdx < list.length - 1,
                            onMoveUp: () =>
                              setBulkCardOrderByJob((prev) => {
                                const cur =
                                  prev[source.jobId] ??
                                  source.outputs.map((o) => o.platform);
                                return {
                                  ...prev,
                                  [source.jobId]: movePlatformInOrder(
                                    cur,
                                    output.platform,
                                    -1
                                  ),
                                };
                              }),
                            onMoveDown: () =>
                              setBulkCardOrderByJob((prev) => {
                                const cur =
                                  prev[source.jobId] ??
                                  source.outputs.map((o) => o.platform);
                                return {
                                  ...prev,
                                  [source.jobId]: movePlatformInOrder(
                                    cur,
                                    output.platform,
                                    1
                                  ),
                                };
                              }),
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {orderedSingleOutputs.map((output, cardIdx) => {
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
                      df={df}
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
                      onRegenerate={(hint) =>
                        handleRegenerate(output.platform, undefined, hint)
                      }
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
                      cardReorder={{
                        canUp: cardIdx > 0,
                        canDown: cardIdx < orderedSingleOutputs.length - 1,
                        onMoveUp: () =>
                          setOutputCardOrder((o) =>
                            movePlatformInOrder(o, output.platform, -1)
                          ),
                        onMoveDown: () =>
                          setOutputCardOrder((o) =>
                            movePlatformInOrder(o, output.platform, 1)
                          ),
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={scheduleOpen}
        onOpenChange={(open) => {
          setScheduleOpen(open);
          if (!open) {
            setSchedulePreviewText("");
            setScheduleDialogTab("schedule");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{d.scheduleDialogTitle}</DialogTitle>
          </DialogHeader>
          <Tabs
            value={scheduleDialogTab}
            onValueChange={(v) =>
              setScheduleDialogTab(v as "schedule" | "preview")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-9">
              <TabsTrigger value="schedule" className="text-xs">
                {d.scheduleTabSchedule}
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                {d.scheduleTabPreview}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">{d.scheduleDateTime}</label>
                <input
                  type="datetime-local"
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your local time (
                  {Intl.DateTimeFormat().resolvedOptions().timeZone})
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="mt-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                {d.schedulePreviewLabel}
              </p>
              <div className="rounded-xl border border-border bg-card p-3 space-y-3 text-card-foreground">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full bg-muted border border-border"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight text-card-foreground">
                      {d.schedulePreviewMockUser}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {schedulePlatform
                        ? SUPPORTED_PLATFORMS.find((p) => p.id === schedulePlatform)
                            ?.name ?? schedulePlatform
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-card-foreground whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {schedulePreviewText.trim() || "—"}
                </div>
              </div>
            </TabsContent>
          </Tabs>
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

      {showFirstRepurposeConfetti && (
        <FirstRepurposeConfetti onDone={dismissFirstRepurposeConfetti} />
      )}
    </div>
  );
}
