"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUserPlan } from "@/hooks/useUserPlan";
import Link from "next/link";

type Step = "upload" | "platforms" | "captions";

type AccountRow = {
  platform: string;
  platformUsername: string | null;
  status: string;
};

const PLATFORMS: {
  id: "instagram" | "facebook" | "twitter" | "linkedin";
  name: string;
  connectPath: string;
  needsConnect: boolean;
}[] = [
  {
    id: "instagram",
    name: "Instagram",
    connectPath: "/api/social/connect/instagram",
    needsConnect: true,
  },
  {
    id: "facebook",
    name: "Facebook",
    connectPath: "/dashboard/connections",
    needsConnect: true,
  },
  {
    id: "twitter",
    name: "X (Twitter)",
    connectPath: "/api/connect/twitter",
    needsConnect: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    connectPath: "/api/social/connect/linkedin",
    needsConnect: true,
  },
];

export function PhotoCaptionClient() {
  const { plan, loading: planLoading } = useUserPlan();
  const [step, setStep] = useState<Step>("upload");
  const [context, setContext] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [selected, setSelected] = useState<
    Set<"instagram" | "facebook" | "twitter" | "linkedin">
  >(new Set());
  const [generating, setGenerating] = useState(false);
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [captionRunId, setCaptionRunId] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");

  const loadAccounts = useCallback(() => {
    fetch("/api/social/accounts")
      .then((r) => r.json())
      .then((d) => setAccounts(d.accounts ?? []))
      .catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const connected = (id: string) =>
    accounts.some((a) => a.platform === id && a.status === "connected");

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      if (plan === "free" && !planLoading) {
        toast.error("Photo uploads require Starter or higher.");
        return;
      }
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("photo", file);
        if (context.trim()) fd.append("context", context.trim());
        const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
        const data = (await res.json()) as {
          error?: string;
          photo?: { id: string };
        };
        if (!res.ok) {
          throw new Error(data.error ?? "Upload failed");
        }
        if (!data.photo?.id) throw new Error("Invalid response");
        setPhotoId(data.photo.id);
        setStep("platforms");
        toast.success("Photo analyzed — pick platforms.");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [context, plan, planLoading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled: uploading || plan === "free",
  });

  function togglePlatform(id: (typeof PLATFORMS)[number]["id"]) {
    if (!connected(id)) {
      const p = PLATFORMS.find((x) => x.id === id);
      if (p?.id === "facebook") {
        window.location.href = "/dashboard/connections";
        return;
      }
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

  async function generateCaptions() {
    if (!photoId || selected.size === 0) {
      toast.error("Select at least one connected platform.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/photos/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId,
          platforms: Array.from(selected),
          outputLanguage: "en",
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        repurpose?: { id: string; captions: Record<string, string> };
      };
      if (!res.ok) throw new Error(data.error ?? "Caption generation failed");
      if (!data.repurpose) throw new Error("Invalid response");
      setCaptions(data.repurpose.captions);
      setCaptionRunId(data.repurpose.id);
      setStep("captions");
      toast.success("Captions ready — review and post.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  async function postNow() {
    if (!captionRunId) return;
    setPosting(true);
    try {
      const res = await fetch("/api/photos/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captionRunId, captions }),
      });
      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        errors?: Record<string, string>;
        postUrls?: Record<string, string>;
      };
      if (!res.ok) throw new Error(data.error ?? "Post failed");
      if (data.success) {
        toast.success("Posted to at least one platform.");
        if (data.postUrls && Object.keys(data.postUrls).length) {
          console.info("Post URLs", data.postUrls);
        }
      } else {
        toast.error(
          data.errors
            ? Object.values(data.errors).join(" · ")
            : "All platforms failed"
        );
      }
      if (data.success) {
        setStep("upload");
        setPhotoId(null);
        setCaptionRunId(null);
        setCaptions({});
        setSelected(new Set());
        setPreview(null);
        setContext("");
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
          captions,
          scheduledFor: new Date(scheduledAt).toISOString(),
        }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) throw new Error(data.error ?? "Schedule failed");
      toast.success("Scheduled. The daily cron will publish it.");
      setStep("upload");
      setPhotoId(null);
      setCaptionRunId(null);
      setCaptions({});
      setSelected(new Set());
      setPreview(null);
      setContext("");
      setScheduleOpen(false);
      setScheduledAt("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Schedule failed");
    } finally {
      setPosting(false);
    }
  }

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

  return (
    <div className="space-y-8 max-w-2xl mx-auto w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Photo to caption
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Upload an image, get platform-specific captions, then post to connected
          accounts. Instagram and Facebook include the image; X and LinkedIn post
          text only for now.
        </p>
      </div>

      <nav aria-label="Progress" className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <StepDot n={1} label="Upload" active={step === "upload"} done={step !== "upload"} />
        <div className="h-px flex-1 bg-border min-w-[12px]" aria-hidden />
        <StepDot
          n={2}
          label="Platforms"
          active={step === "platforms"}
          done={step === "captions"}
        />
        <div className="h-px flex-1 bg-border min-w-[12px]" aria-hidden />
        <StepDot n={3} label="Captions" active={step === "captions"} done={false} />
      </nav>

      {step === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Upload & context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-context">Optional context</Label>
              <Textarea
                id="photo-context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Product name, promo, location — helps the AI."
                rows={3}
                className="resize-y min-h-[80px] text-base sm:text-sm"
              />
            </div>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 sm:p-10 text-center cursor-pointer transition-colors",
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                uploading && "pointer-events-none opacity-60"
              )}
            >
              <input {...getInputProps()} />
              {preview ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Selected preview"
                    className="max-h-56 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive ? "Drop to replace" : "Tap to replace image"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImagePlus className="h-10 w-10 text-muted-foreground" aria-hidden />
                  <p className="font-medium">Drop a photo here or tap to browse</p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WebP · max 10MB
                  </p>
                </div>
              )}
            </div>
            {uploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Uploading and analyzing…
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === "platforms" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Platforms</CardTitle>
            <p className="text-sm text-muted-foreground">
              Connect an account first, then tap to select. Facebook OAuth may still
              be configured in Connections.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {PLATFORMS.map((p) => {
              const ok = connected(p.id);
              const sel = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg border p-4 text-left transition-colors",
                    ok && sel && "border-primary bg-primary/5",
                    ok && !sel && "hover:bg-muted/50",
                    !ok && "opacity-90 hover:bg-muted/30"
                  )}
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {ok
                        ? sel
                          ? "Selected"
                          : "Tap to include"
                        : "Tap to connect"}
                    </div>
                  </div>
                  {ok ? (
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        sel ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      {sel ? "On" : "Off"}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      Connect
                    </span>
                  )}
                </button>
              );
            })}
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button
                onClick={generateCaptions}
                disabled={generating || selected.size === 0}
                className="sm:ml-auto"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating…
                  </>
                ) : (
                  "Generate captions"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "captions" && captionRunId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Review & post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(captions).map(([platform, text]) => (
              <div key={platform} className="space-y-2">
                <div className="flex justify-between gap-2">
                  <Label className="capitalize">{platform}</Label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {text.length} chars
                  </span>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) =>
                    setCaptions((c) => ({ ...c, [platform]: e.target.value }))
                  }
                  rows={6}
                  className="font-mono text-sm resize-y min-h-[120px]"
                />
              </div>
            ))}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("platforms")}>
                Back
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setScheduleOpen((v) => !v)}
              >
                Schedule
              </Button>
              <Button
                className="sm:ml-auto"
                onClick={postNow}
                disabled={posting}
              >
                {posting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Post now"
                )}
              </Button>
            </div>
            {scheduleOpen && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <Label htmlFor="sched">Publish time (local)</Label>
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
                  Confirm schedule
                </Button>
                <p className="text-xs text-muted-foreground">
                  Uses the same daily cron as other scheduled posts (see docs).
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
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
    <div className="flex flex-col items-center gap-1 min-w-0">
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
          done && "bg-primary text-primary-foreground border-primary",
          active && !done && "border-primary text-primary",
          !active && !done && "border-muted-foreground/30 text-muted-foreground"
        )}
        aria-current={active ? "step" : undefined}
      >
        {done ? <Check className="h-4 w-4" aria-hidden /> : n}
      </span>
      <span className="text-muted-foreground truncate max-w-[4.5rem] sm:max-w-none text-center">
        {label}
      </span>
    </div>
  );
}
