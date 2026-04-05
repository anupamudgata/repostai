"use client";

import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/hooks/use-app-toast";

type PreviewPlatform = "linkedin" | "twitter_single";

export function BrandVoicePreviewPanel({ voiceId }: { voiceId: string }) {
  const toastT = useAppToast();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<PreviewPlatform>("linkedin");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");

  async function runPreview() {
    const t = topic.trim();
    if (t.length < 10) {
      toastT.error("toast.brandVoicePreviewTopicShort");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/brand-voice/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandVoiceId: voiceId, topic: t, platform }),
      });
      const data = (await res.json()) as { error?: string; code?: string; text?: string };
      if (!res.ok) {
        toastT.errorFromApi({ error: data.error, code: data.code });
        return;
      }
      setOutput(data.text ?? "");
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-border/60 bg-muted/10 p-3 space-y-3">
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Wand2 className="h-3.5 w-3.5 text-primary" />
        Try this voice
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Paste a topic or rough idea — we&apos;ll generate one sample post in your trained voice (not saved to history).
      </p>
      <div className="space-y-1.5">
        <Label className="text-xs">Platform</Label>
        <Select
          value={platform}
          onValueChange={(v) => setPlatform(v as PreviewPlatform)}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="twitter_single">X / single post</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Topic or snippet</Label>
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Why we’re doubling down on customer research this quarter"
          className="min-h-[72px] text-sm resize-y"
          maxLength={2000}
        />
      </div>
      <Button
        type="button"
        size="sm"
        className="w-full sm:w-auto gap-2"
        disabled={loading}
        onClick={() => void runPreview()}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Wand2 className="h-3.5 w-3.5" />
        )}
        Generate sample
      </Button>
      {output ? (
        <div className="rounded-lg border border-border/50 bg-background p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Preview
          </p>
          <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
            {output}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
