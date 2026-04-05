"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Link as LinkIcon,
  Type,
  Youtube,
  FileText,
  Loader2,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InputType } from "@/types";
import type { DashboardBulk } from "@/messages/dashboard-bulk.en";

const INPUT_TABS = [
  { id: "text" as InputType, icon: Type },
  { id: "url" as InputType, icon: LinkIcon },
  { id: "youtube" as InputType, icon: Youtube },
  { id: "pdf" as InputType, icon: FileText },
];

type ToastApi = {
  error: (key: string, params?: Record<string, string | number>) => void;
  errorFromApi: (
    payload: { error?: string; code?: string },
    fallbackKey?: string
  ) => void;
  success: (key: string, params?: Record<string, string | number>) => void;
};

export function SourceInputPanel({
  d,
  df,
  toastT,
  inputType,
  setInputType,
  content,
  setContent,
  url,
  setUrl,
  bulkMode,
  setBulkMode,
  bulkUrls,
  setBulkUrls,
  selectedPlatformCount,
  pdfExtracting,
  setPdfExtracting,
  pdfFileName,
  setPdfFileName,
  pdfExtractedText,
  setPdfExtractedText,
}: {
  d: DashboardBulk;
  df: (template: string, vars: Record<string, string | number>) => string;
  toastT: ToastApi;
  inputType: InputType;
  setInputType: (v: InputType) => void;
  content: string;
  setContent: (v: string) => void;
  url: string;
  setUrl: (v: string) => void;
  bulkMode: boolean;
  setBulkMode: (v: boolean) => void;
  bulkUrls: string;
  setBulkUrls: (v: string) => void;
  selectedPlatformCount: number;
  pdfExtracting: boolean;
  setPdfExtracting: (v: boolean) => void;
  pdfFileName: string;
  setPdfFileName: (v: string) => void;
  pdfExtractedText: string;
  setPdfExtractedText: (v: string) => void;
}) {
  const trimmed = content.trim();
  const wordCount = trimmed
    ? trimmed.split(/\s+/).filter((w) => w.length > 0).length
    : 0;
  const charCount = content.length;
  const readMinutes = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  const mainTextRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputType !== "text") return;
    const el = mainTextRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxPx = 400;
    const minPx = 120;
    const target = Math.min(maxPx, Math.max(minPx, el.scrollHeight));
    el.style.height = `${target}px`;
    el.style.overflowY = el.scrollHeight > maxPx ? "auto" : "hidden";
  }, [content, inputType]);

  return (
    <Card className="dash-card border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold">{d.yourContent}</CardTitle>
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

          <TabsContent value="text" className="mt-4 space-y-3">
            <Textarea
              ref={mainTextRef}
              placeholder={d.placeholderText}
              className="min-h-[120px] max-h-[400px] resize-none overflow-hidden"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {charCount > 0 && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {charCount} characters
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground tabular-nums">
                <span>{df(d.inputStatsWords, { count: wordCount })}</span>
                {wordCount > 0 && (
                  <>
                    <span className="text-border">·</span>
                    <span>
                      {wordCount < 200
                        ? d.inputStatsReadTimeSubminute
                        : df(d.inputStatsReadTime, { minutes: readMinutes })}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => {
                    setContent(d.sampleContentParagraph);
                    toastT.success("toast.sampleContentInserted");
                  }}
                >
                  {d.sampleContentButton}
                </Button>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => setInputType("url")}
                >
                  {d.switchToUrlTab}
                </button>
              </div>
            </div>
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
                  !bulkMode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                  bulkMode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
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
                  placeholder={
                    "https://example.com/post-1\nhttps://example.com/post-2\nhttps://example.com/post-3"
                  }
                  className="min-h-[140px] mt-2 font-mono text-sm"
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {df(d.bulkUrlsHint, {
                    platforms: selectedPlatformCount,
                    max: selectedPlatformCount * 5,
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
  );
}
