"use client";

import { useState } from "react";
import {
  Scissors,
  Youtube,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Clip = {
  startTime: number;
  endTime: number;
  startFormatted: string;
  endFormatted: string;
  reason: string;
  hook: string;
  caption: string;
  suggestedLength: string;
  youtubeUrl: string;
};

export default function ClipsPage() {
  const [inputMode, setInputMode] = useState<"url" | "transcript">("url");
  const [url, setUrl] = useState("");
  const [pastedTranscript, setPastedTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (inputMode === "url" && !url.trim()) {
      toast.error("Enter a YouTube URL");
      return;
    }
    if (inputMode === "transcript" && !pastedTranscript.trim()) {
      toast.error("Paste a transcript with timestamps");
      return;
    }
    if (inputMode === "transcript" && pastedTranscript.trim().length < 100) {
      toast.error("Transcript is too short. Paste at least 100 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    setClips([]);
    try {
      const body = inputMode === "url"
        ? { url: url.trim() }
        : { transcript: pastedTranscript.trim(), url: url.trim() || undefined };
      const res = await fetch("/api/video/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      let data: { error?: string; clips?: Clip[]; videoUrl?: string; videoId?: string };
      try {
        data = await res.json();
      } catch {
        setError("Invalid response from server. Please try again.");
        toast.error("Could not read server response");
        return;
      }
      if (!res.ok) {
        const errMsg = data.error || "Could not extract clips from this video";
        setError(errMsg);
        toast.error(errMsg);
        return;
      }
      const clipsData = data.clips ?? [];
      if (clipsData.length === 0) {
        setError("No clip-worthy moments found. The video may have no captions, or the transcript was too short. Try a video with subtitles enabled.");
        toast.error("No clips found");
        return;
      }
      setClips(clipsData);
      setVideoUrl(data.videoUrl ?? "");
      setVideoId(data.videoId ?? "");
      toast.success(`Found ${clipsData.length} clip-worthy moments`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error. Please check your connection and try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(caption: string, index: number) {
    await navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    toast.success("Caption copied to clipboard");
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Scissors className="h-8 w-8 text-primary" />
          Video → Clips
        </h1>
        <p className="text-muted-foreground mt-1">
          Extract viral moments from long videos. Paste a YouTube URL → AI identifies clip-worthy segments and generates captions for TikTok, Reels, and Shorts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">YouTube video</CardTitle>
          <p className="text-sm text-muted-foreground">
            Paste a URL or transcript. If the video has no captions, copy the transcript from YouTube and paste it below.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={inputMode} onValueChange={(v) => { setInputMode(v as "url" | "transcript"); setError(null); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-2">
                <Youtube className="h-4 w-4" />
                YouTube URL
              </TabsTrigger>
              <TabsTrigger value="transcript" className="gap-2">
                <FileText className="h-4 w-4" />
                Paste transcript
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="mt-4">
              <div>
                <Label htmlFor="clip-url">YouTube URL</Label>
                <Input
                  id="clip-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(null);
                  }}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Video must have captions enabled. No captions? Switch to &quot;Paste transcript&quot; and copy from YouTube.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="transcript" className="mt-4">
              <div>
                <Label htmlFor="clip-transcript">Transcript with timestamps</Label>
                <Textarea
                  id="clip-transcript"
                  placeholder="[0:00] Intro text here...&#10;[0:45] Main point...&#10;[1:30] Another moment..."
                  className="mt-2 min-h-[200px] font-mono text-sm"
                  value={pastedTranscript}
                  onChange={(e) => {
                    setPastedTranscript(e.target.value);
                    setError(null);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a transcript with timestamps. Format: [M:SS] or [H:MM:SS] followed by text. You can copy from YouTube (CC → Transcript) or any tool.
                </p>
              </div>
              {url.trim() && (
                <div className="mt-3">
                  <Label htmlFor="clip-url-opt">YouTube URL (optional, for share links)</Label>
                  <Input
                    id="clip-url-opt"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive space-y-2">
              <p>{error}</p>
              {error.toLowerCase().includes("no captions") && inputMode === "url" && (
                <button
                  type="button"
                  onClick={() => setInputMode("transcript")}
                  className="text-primary hover:underline font-medium"
                >
                  Switch to Paste transcript →
                </button>
              )}
            </div>
          )}
          <Button
            onClick={handleExtract}
            disabled={loading}
            className="w-full gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting clips...
              </>
            ) : (
              <>
                <Scissors className="h-4 w-4" />
                Extract viral moments
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {clips.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Clip suggestions</h2>
          <p className="text-sm text-muted-foreground">
            Use these timestamps in CapCut, OpusClip, or YouTube Studio to export. Copy captions for TikTok/Reels.
          </p>
          <div className="space-y-4">
            {clips.map((clip, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Clip {i + 1}: {clip.startFormatted} → {clip.endFormatted}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {clip.reason}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {videoId && videoId !== "pasted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a
                            href={clip.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Open at {clip.startFormatted}
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(clip.caption, i)}
                      >
                        {copiedIndex === i ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy caption
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Hook (first line)</p>
                    <p className="text-sm font-medium mt-0.5">{clip.hook}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Full caption</p>
                    <p className="text-sm whitespace-pre-wrap mt-0.5 bg-muted/50 rounded-lg p-3">
                      {clip.caption}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Suggested length: {clip.suggestedLength} seconds
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="border-muted">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">
            <strong>How to use:</strong> Export clips in CapCut or OpusClip using the timestamps above. Paste the generated caption when posting to TikTok, Reels, or YouTube Shorts. For best results, use the hook as your first line or on-screen text.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
