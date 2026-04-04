"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ImagePlus,
  Loader2,
  Check,
  X,
  RefreshCw,
  Hash,
  ChevronLeft,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUserPlan } from "@/hooks/useUserPlan";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Step = "upload" | "platforms" | "generating" | "review" | "post";

type PostMode = "single" | "carousel";

type PlatformId = "instagram" | "facebook" | "twitter" | "linkedin";

type UploadedPhoto = {
  id: string;
  thumbnailUrl: string;
  publicUrl: string;
  status: string;
};

type LocalPhoto = {
  file: File;
  previewUrl: string;
  progress: number; // 0-100, -1 = error
  uploaded?: UploadedPhoto;
};

type AccountRow = {
  platform: string;
  platformUsername: string | null;
  status: string;
};

type CaptionVariations = Record<PlatformId, [string, string, string]>;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORMS: {
  id: PlatformId;
  name: string;
  connectPath: string;
  color: string;
  badge: string;
  limit: number;
  supportsCarousel: boolean;
}[] = [
  {
    id: "instagram",
    name: "Instagram",
    connectPath: "/api/social/connect/instagram",
    color: "bg-pink-500",
    badge: "text-pink-700 bg-pink-100 dark:text-pink-300 dark:bg-pink-900/40",
    limit: 2200,
    supportsCarousel: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    connectPath: "/dashboard/connections",
    color: "bg-blue-600",
    badge:
      "text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40",
    limit: 63206,
    supportsCarousel: false,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    connectPath: "/api/connect/twitter",
    color: "bg-neutral-900 dark:bg-neutral-100",
    badge:
      "text-neutral-700 bg-neutral-100 dark:text-neutral-200 dark:bg-neutral-800",
    limit: 280,
    supportsCarousel: false,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    connectPath: "/api/social/connect/linkedin",
    color: "bg-sky-600",
    badge:
      "text-sky-700 bg-sky-100 dark:text-sky-300 dark:bg-sky-900/40",
    limit: 3000,
    supportsCarousel: false,
  },
];

const STEP_LABELS: { id: Step; label: string }[] = [
  { id: "upload", label: "Upload" },
  { id: "platforms", label: "Platforms" },
  { id: "generating", label: "Generate" },
  { id: "review", label: "Review" },
  { id: "post", label: "Post" },
];

const STEP_ORDER: Step[] = [
  "upload",
  "platforms",
  "generating",
  "review",
  "post",
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function stepIndex(s: Step) {
  return STEP_ORDER.indexOf(s);
}

function extractHashtags(text: string): string[] {
  const found = text.match(/#[\w]+/g) ?? [];
  return [...new Set(found)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function PhotoCaptionClient() {
  const { plan, loading: planLoading } = useUserPlan();

  // ── Navigation ──
  const [step, setStep] = useState<Step>("upload");

  // ── Upload step ──
  const [postMode, setPostMode] = useState<PostMode>("single");
  const [context, setContext] = useState("");
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);

  // ── Platform step ──
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [selected, setSelected] = useState<Set<PlatformId>>(new Set());

  // ── Caption step ──
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState<Partial<CaptionVariations>>({});
  const [selectedVariation, setSelectedVariation] = useState<
    Record<PlatformId, number>
  >({} as Record<PlatformId, number>);
  const [editedCaptions, setEditedCaptions] = useState<
    Partial<Record<PlatformId, string>>
  >({});
  const [captionRunId, setCaptionRunId] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<
    Partial<Record<PlatformId, string[]>>
  >({});
  const [activeHashtags, setActiveHashtags] = useState<
    Partial<Record<PlatformId, Set<string>>>
  >({});

  // ── Post step ──
  const [posting, setPosting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [postUrls, setPostUrls] = useState<Record<string, string>>({});
  const [posted, setPosted] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  // ── Load accounts ──
  const loadAccounts = useCallback(() => {
    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((d: { accounts?: AccountRow[] }) =>
        setAccounts(d.accounts ?? [])
      )
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const connected = (id: PlatformId) =>
    accounts.some((a) => a.platform === id && a.status === "connected");

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1: Upload
  // ─────────────────────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (plan === "free" && !planLoading) {
        toast.error("Photo uploads require Starter or higher.");
        return;
      }
      setPhotos((prev) => {
        const slots = 10 - prev.length;
        if (slots <= 0) {
          toast.error("Maximum 10 photos allowed.");
          return prev;
        }
        const toAdd = acceptedFiles.slice(0, slots).map((file) => ({
          file,
          previewUrl: URL.createObjectURL(file),
          progress: 0,
        }));
        if (acceptedFiles.length > slots) {
          toast.warning(`Only ${slots} more photo(s) allowed. Extras ignored.`);
        }
        return [...prev, ...toAdd];
      });
    },
    [plan, planLoading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    disabled: uploading || plan === "free",
  });

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].previewUrl);
      next.splice(idx, 1);
      return next;
    });
  }

  async function analyzePhotos() {
    if (photos.length === 0) {
      toast.error("Add at least one photo.");
      return;
    }
    setUploading(true);

    // Simulate progressive progress while uploading
    const fd = new FormData();
    photos.forEach((p) => fd.append("photos[]", p.file));
    if (context.trim()) fd.append("context", context.trim());

    // Show 0→80 progress immediately then wait for response
    setPhotos((prev) =>
      prev.map((p) => ({ ...p, progress: 10 }))
    );

    const interval = setInterval(() => {
      setPhotos((prev) =>
        prev.map((p) => ({
          ...p,
          progress: p.progress < 80 ? p.progress + 10 : p.progress,
        }))
      );
    }, 300);

    try {
      const res = await fetch("/api/photos/batch-upload", {
        method: "POST",
        body: fd,
      });
      clearInterval(interval);

      const data = (await res.json()) as {
        error?: string;
        photos?: UploadedPhoto[];
      };
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      if (!data.photos?.length) throw new Error("Invalid response from server");

      setUploadedPhotos(data.photos);
      setPhotos((prev) =>
        prev.map((p, i) => ({
          ...p,
          progress: 100,
          uploaded: data.photos![i],
        }))
      );
      setTimeout(() => {
        setStep("platforms");
        toast.success("Photos analyzed — pick platforms.");
      }, 400);
    } catch (e) {
      clearInterval(interval);
      setPhotos((prev) => prev.map((p) => ({ ...p, progress: -1 })));
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2: Platform selection
  // ─────────────────────────────────────────────────────────────────────────

  function togglePlatform(id: PlatformId) {
    if (!connected(id)) {
      const p = PLATFORMS.find((x) => x.id === id);
      window.location.href = p?.connectPath ?? "/dashboard/connections";
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const carouselNote =
    postMode === "carousel" &&
    selected.size > 0 &&
    [...selected].some((id) => !PLATFORMS.find((p) => p.id === id)?.supportsCarousel);

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3: Generate captions
  // ─────────────────────────────────────────────────────────────────────────

  async function generateCaptions() {
    if (selected.size === 0) {
      toast.error("Select at least one connected platform.");
      return;
    }
    const primaryPhotoId = uploadedPhotos[0]?.id;
    if (!primaryPhotoId) {
      toast.error("No uploaded photo found.");
      return;
    }

    setGenerating(true);
    setStep("generating");

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      // Try variations endpoint first
      let vars: Partial<CaptionVariations> = {};
      let runId: string | null = null;

      try {
        const variRes = await fetch("/api/photos/captions/variations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoId: primaryPhotoId,
            platforms: Array.from(selected),
            outputLanguage: "en",
            count: 3,
          }),
          signal: abortRef.current.signal,
        });
        const variData = (await variRes.json()) as {
          error?: string;
          variations?: Partial<CaptionVariations>;
          runId?: string;
        };
        if (variRes.ok && variData.variations) {
          vars = variData.variations;
          runId = variData.runId ?? null;
        } else {
          throw new Error("variations endpoint error");
        }
      } catch {
        // Fallback to /api/photos/captions
        const capRes = await fetch("/api/photos/captions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            photoId: primaryPhotoId,
            platforms: Array.from(selected),
            outputLanguage: "en",
          }),
        });
        const capData = (await capRes.json()) as {
          error?: string;
          repurpose?: { id: string; captions: Record<string, string> };
        };
        if (!capRes.ok)
          throw new Error(capData.error ?? "Caption generation failed");
        if (!capData.repurpose) throw new Error("Invalid response");

        // Wrap single caption as first variation
        runId = capData.repurpose.id;
        for (const [platform, text] of Object.entries(capData.repurpose.captions)) {
          const pid = platform as PlatformId;
          vars[pid] = [text, text, text];
        }
      }

      setCaptionRunId(runId);
      setVariations(vars);

      // Set default selected variation = 0 and edited captions = first variation
      const defaultSel: Record<PlatformId, number> = {} as Record<
        PlatformId,
        number
      >;
      const defaultEdited: Partial<Record<PlatformId, string>> = {};
      const defaultHashtags: Partial<Record<PlatformId, string[]>> = {};
      const defaultActiveHashtags: Partial<Record<PlatformId, Set<string>>> =
        {};

      for (const [platform, texts] of Object.entries(vars)) {
        const pid = platform as PlatformId;
        defaultSel[pid] = 0;
        defaultEdited[pid] = texts[0];
        const tags = extractHashtags(texts[0]);
        defaultHashtags[pid] = tags;
        defaultActiveHashtags[pid] = new Set(tags);
      }

      setSelectedVariation(defaultSel);
      setEditedCaptions(defaultEdited);
      setHashtags(defaultHashtags);
      setActiveHashtags(defaultActiveHashtags);
      setStep("review");
      toast.success("Captions ready — review and pick your favorites.");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      toast.error(e instanceof Error ? e.message : "Generation failed");
      setStep("platforms");
    } finally {
      setGenerating(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 4: Caption review helpers
  // ─────────────────────────────────────────────────────────────────────────

  function selectVariation(platform: PlatformId, idx: number) {
    const texts = variations[platform];
    if (!texts) return;
    setSelectedVariation((prev) => ({ ...prev, [platform]: idx }));
    const text = texts[idx];
    setEditedCaptions((prev) => ({ ...prev, [platform]: text }));
    const tags = extractHashtags(text);
    setHashtags((prev) => ({ ...prev, [platform]: tags }));
    setActiveHashtags((prev) => ({
      ...prev,
      [platform]: new Set(tags),
    }));
  }

  function updateEdited(platform: PlatformId, text: string) {
    setEditedCaptions((prev) => ({ ...prev, [platform]: text }));
    const tags = extractHashtags(text);
    setHashtags((prev) => {
      // Merge new tags with existing
      const existing = prev[platform] ?? [];
      const merged = [...new Set([...existing, ...tags])];
      return { ...prev, [platform]: merged };
    });
  }

  function toggleHashtag(platform: PlatformId, tag: string) {
    setActiveHashtags((prev) => {
      const set = new Set(prev[platform] ?? []);
      if (set.has(tag)) set.delete(tag);
      else set.add(tag);
      return { ...prev, [platform]: set };
    });
    // Also toggle in caption text
    setEditedCaptions((prev) => {
      const text = prev[platform] ?? "";
      const activeSet = new Set(activeHashtags[platform] ?? []);
      if (activeSet.has(tag)) {
        // Remove from text
        return {
          ...prev,
          [platform]: text.replace(new RegExp(`\\s?${tag}\\b`, "g"), "").trim(),
        };
      } else {
        // Add to text
        return { ...prev, [platform]: `${text} ${tag}`.trim() };
      }
    });
  }

  async function regeneratePlatform(platform: PlatformId) {
    const primaryPhotoId = uploadedPhotos[0]?.id;
    if (!primaryPhotoId) return;
    toast.info(`Regenerating ${PLATFORMS.find((p) => p.id === platform)?.name}…`);

    try {
      const res = await fetch("/api/photos/captions/variations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: primaryPhotoId,
          platforms: [platform],
          outputLanguage: "en",
          count: 3,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        variations?: Partial<CaptionVariations>;
      };
      if (!res.ok || !data.variations) throw new Error("Regeneration failed");

      const texts = data.variations[platform];
      if (!texts) throw new Error("No captions returned");

      setVariations((prev) => ({ ...prev, [platform]: texts }));
      selectVariation(platform, 0);
      toast.success("New variations ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Step 5: Post / Schedule
  // ─────────────────────────────────────────────────────────────────────────

  // Build final captions including active hashtags appended cleanly
  function buildFinalCaptions(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const platform of selected) {
      const base = editedCaptions[platform] ?? "";
      result[platform] = base;
    }
    return result;
  }

  async function postNow() {
    if (!captionRunId) {
      toast.error("Caption run ID missing — please regenerate.");
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/photos/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captionRunId,
          captions: buildFinalCaptions(),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        errors?: Record<string, string>;
        postUrls?: Record<string, string>;
      };
      if (!res.ok) throw new Error(data.error ?? "Post failed");
      if (data.success) {
        setPostUrls(data.postUrls ?? {});
        setPosted(true);
        toast.success("Posted successfully!");
      } else {
        toast.error(
          data.errors
            ? Object.values(data.errors).join(" · ")
            : "All platforms failed"
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Post failed");
    } finally {
      setPosting(false);
    }
  }

  async function schedulePost() {
    if (!captionRunId || !scheduledAt) return;
    setPosting(true);
    try {
      const res = await fetch("/api/photos/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          captionRunId,
          captions: buildFinalCaptions(),
          scheduledFor: new Date(scheduledAt).toISOString(),
        }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) throw new Error(data.error ?? "Schedule failed");
      toast.success("Scheduled — the daily cron will publish it.");
      setPosted(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Schedule failed");
    } finally {
      setPosting(false);
    }
  }

  function resetAll() {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setStep("upload");
    setPhotos([]);
    setUploadedPhotos([]);
    setContext("");
    setPostMode("single");
    setSelected(new Set());
    setVariations({});
    setEditedCaptions({});
    setHashtags({});
    setActiveHashtags({});
    setSelectedVariation({} as Record<PlatformId, number>);
    setCaptionRunId(null);
    setPostUrls({});
    setPosted(false);
    setScheduleOpen(false);
    setScheduledAt("");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Free-plan gate
  // ─────────────────────────────────────────────────────────────────────────

  if (!planLoading && plan === "free") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Photo → captions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Photo uploads and vision captions are available on{" "}
            <strong className="text-foreground">Starter</strong>,{" "}
            <strong className="text-foreground">Pro</strong>, and{" "}
            <strong className="text-foreground">Agency</strong>.
          </p>
          <Button asChild>
            <Link href="/pricing">View plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Photo to caption
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Upload up to 10 photos, get AI-generated captions for every platform,
          then post or schedule.
        </p>
      </div>

      {/* Step nav */}
      <StepNav current={step} />

      {/* ── Step 1: Upload ─────────────────────────────────────────────── */}
      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Upload & context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Mode selector */}
            <div className="space-y-2">
              <Label>Post mode</Label>
              <div className="flex gap-2">
                {(["single", "carousel"] as PostMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPostMode(mode)}
                    className={cn(
                      "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      postMode === mode
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {mode === "single" ? "Single Post" : "Carousel"}
                    {mode === "carousel" && (
                      <span className="ml-1.5 text-xs opacity-60">
                        Instagram only
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Context */}
            <div className="space-y-2">
              <Label htmlFor="photo-context">Optional context</Label>
              <Textarea
                id="photo-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Product name, promo details, location — helps the AI write better captions."
                rows={3}
                className="resize-y min-h-[72px]"
              />
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <ImagePlus
                  className="h-10 w-10 text-muted-foreground"
                  aria-hidden
                />
                <p className="font-medium">
                  {isDragActive
                    ? "Drop photos here"
                    : "Drag & drop photos or tap to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP · max 10 MB per photo · up to 10 photos
                </p>
              </div>
            </div>

            {/* Thumbnail grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative group aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.previewUrl}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {/* Progress overlay */}
                    {uploading && p.progress < 100 && p.progress >= 0 && (
                      <div className="absolute inset-0 rounded-lg bg-black/50 flex flex-col items-center justify-center gap-1">
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                        <span className="text-white text-xs">
                          {p.progress}%
                        </span>
                      </div>
                    )}
                    {/* Done overlay */}
                    {p.progress === 100 && (
                      <div className="absolute inset-0 rounded-lg bg-black/30 flex items-center justify-center">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {/* Error */}
                    {p.progress === -1 && (
                      <div className="absolute inset-0 rounded-lg bg-destructive/40 flex items-center justify-center">
                        <X className="h-6 w-6 text-white" />
                      </div>
                    )}
                    {/* Remove button */}
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Action */}
            <Button
              className="w-full sm:w-auto"
              onClick={analyzePhotos}
              disabled={uploading || photos.length === 0}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading & analyzing…
                </>
              ) : (
                "Analyze photos"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Platforms ───────────────────────────────────────────── */}
      {step === "platforms" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Select platforms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {carouselNote && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                Carousel is Instagram-only. Other selected platforms will
                receive the single best photo.
              </div>
            )}

            {PLATFORMS.map((p) => {
              const ok = connected(p.id);
              const sel = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-xl border p-4 text-left transition-colors",
                    ok && sel && "border-primary bg-primary/5",
                    ok && !sel && "hover:bg-muted/50",
                    !ok && "opacity-80 hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full shrink-0",
                        p.color
                      )}
                      aria-hidden
                    />
                    <div>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {ok
                          ? sel
                            ? "Selected"
                            : "Tap to include"
                          : "Tap to connect"}
                        {p.supportsCarousel && postMode === "carousel" && (
                          <span className="ml-2 text-pink-600 dark:text-pink-400">
                            Carousel supported
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {ok ? (
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        sel
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {sel && (
                        <Check className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      Connect
                    </span>
                  )}
                </button>
              );
            })}

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={generateCaptions}
                disabled={generating || selected.size === 0}
                className="sm:ml-auto"
              >
                Generate captions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Generating ─────────────────────────────────────────── */}
      {step === "generating" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">
                Generating 3 variations per platform…
              </p>
              <p className="text-sm text-muted-foreground">
                Our AI is writing captions tailored to each platform&apos;s
                style.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Caption review ─────────────────────────────────────── */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">4. Review captions</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("platforms")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          {[...selected].map((platform) => {
            const meta = PLATFORMS.find((p) => p.id === platform)!;
            const vars = variations[platform];
            const selIdx = selectedVariation[platform] ?? 0;
            const edited = editedCaptions[platform] ?? "";
            const limit = meta.limit;
            const overLimit = edited.length > limit;
            const tags = hashtags[platform] ?? [];
            const activeTags = activeHashtags[platform] ?? new Set();

            return (
              <Card key={platform} className="overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full shrink-0",
                          meta.color
                        )}
                        aria-hidden
                      />
                      <CardTitle className="text-base">{meta.name}</CardTitle>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          meta.badge
                        )}
                      >
                        {limit >= 10000
                          ? `${(limit / 1000).toFixed(0)}K chars`
                          : `${limit} chars`}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => regeneratePlatform(platform)}
                      className="text-muted-foreground"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="hidden sm:inline">Regenerate</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {/* 3 variation cards */}
                  {vars && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {vars.map((text, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectVariation(platform, i)}
                          className={cn(
                            "text-left rounded-lg border p-3 text-xs leading-relaxed transition-all h-full",
                            selIdx === i
                              ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                              : "border-border hover:border-muted-foreground/50 hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-[10px] uppercase tracking-wide text-muted-foreground">
                              Option {i + 1}
                            </span>
                            {selIdx === i && (
                              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="line-clamp-5 text-foreground">{text}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Edit textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Edit selected caption
                      </Label>
                      <span
                        className={cn(
                          "text-xs tabular-nums",
                          overLimit
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {edited.length} / {limit.toLocaleString()}
                        {overLimit && " — over limit!"}
                      </span>
                    </div>
                    <Textarea
                      value={edited}
                      onChange={(e) => updateEdited(platform, e.target.value)}
                      rows={5}
                      className={cn(
                        "resize-y min-h-[100px] text-sm",
                        overLimit && "border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                  </div>

                  {/* Hashtag panel */}
                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Hash className="h-3.5 w-3.5" />
                        <span>Hashtags — click to toggle</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => {
                          const active = activeTags.has(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleHashtag(platform, tag)}
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setStep("platforms")}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              className="sm:ml-auto"
              onClick={() => setStep("post")}
            >
              Continue to post
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 5: Post / Schedule ────────────────────────────────────── */}
      {step === "post" && !posted && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">5. Post or schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Summary */}
            <div className="rounded-xl bg-muted/40 border p-4 space-y-3">
              <p className="text-sm font-medium">
                Ready to post to {selected.size} platform
                {selected.size > 1 ? "s" : ""}
              </p>
              {/* Thumbnails */}
              {uploadedPhotos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uploadedPhotos.slice(0, 5).map((ph) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={ph.id}
                      src={ph.thumbnailUrl}
                      alt="Uploaded photo"
                      className="h-16 w-16 rounded-lg object-cover border"
                    />
                  ))}
                  {uploadedPhotos.length > 5 && (
                    <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                      +{uploadedPhotos.length - 5}
                    </div>
                  )}
                </div>
              )}
              {/* Platform list */}
              <div className="flex flex-wrap gap-2">
                {[...selected].map((id) => {
                  const meta = PLATFORMS.find((p) => p.id === id)!;
                  return (
                    <span
                      key={id}
                      className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        meta.badge
                      )}
                    >
                      {meta.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("review")}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => setScheduleOpen((v) => !v)}
                className="sm:ml-auto"
              >
                <Clock className="h-4 w-4" />
                Schedule
              </Button>
              <Button onClick={postNow} disabled={posting}>
                {posting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Post now"
                )}
              </Button>
            </div>

            {scheduleOpen && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <Label htmlFor="sched">Publish time (your local time)</Label>
                <input
                  id="sched"
                  type="datetime-local"
                  value={scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Button
                  className="w-full"
                  disabled={posting || !scheduledAt}
                  onClick={schedulePost}
                >
                  {posting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Confirm schedule"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Uses the daily cron — posts within a few minutes of the
                  selected time.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Post success ───────────────────────────────────────────────── */}
      {step === "post" && posted && (
        <Card>
          <CardContent className="flex flex-col items-center gap-5 py-14 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-bold">
                {scheduledAt ? "Scheduled!" : "Posted!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {scheduledAt
                  ? `Your content is scheduled for ${new Date(scheduledAt).toLocaleString()}.`
                  : "Your content is now live."}
              </p>
            </div>
            {Object.keys(postUrls).length > 0 && (
              <div className="w-full max-w-xs space-y-2">
                {Object.entries(postUrls).map(([platform, url]) => {
                  const meta = PLATFORMS.find((p) => p.id === platform);
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <span className="font-medium">
                        {meta?.name ?? platform}
                      </span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  );
                })}
              </div>
            )}
            <Button onClick={resetAll}>Start over</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StepNav({ current }: { current: Step }) {
  const currentIdx = stepIndex(current);
  return (
    <nav aria-label="Progress" className="flex items-center gap-1 sm:gap-2">
      {STEP_LABELS.map(({ id, label }, i) => {
        const idx = stepIndex(id);
        const done = currentIdx > idx;
        const active = current === id;
        return (
          <div key={id} className="flex items-center gap-1 sm:gap-2 min-w-0">
            {i > 0 && (
              <div
                className={cn(
                  "h-px flex-1 min-w-[8px] sm:min-w-[16px] transition-colors",
                  done ? "bg-primary" : "bg-border"
                )}
                aria-hidden
              />
            )}
            <StepDot n={i + 1} label={label} active={active} done={done} />
          </div>
        );
      })}
    </nav>
  );
}

function StepDot({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-0 shrink-0">
      <span
        className={cn(
          "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
          done &&
            "bg-primary text-primary-foreground border-primary",
          active &&
            !done &&
            "border-primary text-primary",
          !active && !done && "border-muted-foreground/30 text-muted-foreground"
        )}
        aria-current={active ? "step" : undefined}
      >
        {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}
      </span>
      <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[3.5rem] sm:max-w-[5rem] text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
