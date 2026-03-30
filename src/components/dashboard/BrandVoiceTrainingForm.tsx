"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, ChevronDown, ChevronUp, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/hooks/use-app-toast";
import { HUMANIZATION_LEVELS } from "@/config/constants";
import type { HumanizationLevel } from "@/types";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { id: "linkedin", label: "LinkedIn Post" },
  { id: "twitter", label: "Twitter / Thread" },
  { id: "blog", label: "Blog / Article" },
  { id: "newsletter", label: "Newsletter" },
  { id: "caption", label: "Caption / Story" },
  { id: "other", label: "Other" },
] as const;

type ContentTypeId = (typeof CONTENT_TYPES)[number]["id"];

interface SampleSlot {
  id: number;
  type: ContentTypeId;
  text: string;
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function SlotQuality({ words }: { words: number }) {
  if (words === 0) return null;
  if (words >= 80)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        {words}w · Great
      </span>
    );
  if (words >= 40)
    return (
      <span className="text-[11px] font-medium text-amber-500">
        {words}w · Add more
      </span>
    );
  return (
    <span className="text-[11px] text-muted-foreground">{words}w · Too short</span>
  );
}

export type BrandVoiceTrainingPayload = {
  name: string;
  samples: string;
  humanizationLevel: HumanizationLevel;
  imperfectionMode: boolean;
  personalStoryInjection: boolean;
};

export interface BrandVoiceTrainingFormProps {
  existingVoices: { id: string; name: string }[];
  limit: number;
  onSubmit: (payload: BrandVoiceTrainingPayload) => Promise<void>;
  onCancel?: () => void;
}

export function BrandVoiceTrainingForm({
  existingVoices,
  limit,
  onSubmit,
  onCancel,
}: BrandVoiceTrainingFormProps) {
  const toastT = useAppToast();
  const [name, setName] = useState("");
  const [slots, setSlots] = useState<SampleSlot[]>([
    { id: 1, type: "linkedin", text: "" },
    { id: 2, type: "twitter", text: "" },
    { id: 3, type: "blog", text: "" },
  ]);
  const [humanizationLevel, setHumanizationLevel] =
    useState<HumanizationLevel>("professional");
  const [imperfectionMode, setImperfectionMode] = useState(false);
  const [personalStoryInjection, setPersonalStoryInjection] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);

  const count = existingVoices.length;
  const canCreate = limit > 0 && count < limit;

  const filledSlots = slots.filter((s) => countWords(s.text) >= 40);
  const totalWords = slots.reduce((acc, s) => acc + countWords(s.text), 0);
  const qualityPct = Math.min(100, Math.round((filledSlots.length / 3) * 100));

  function updateSlot(id: number, key: keyof SampleSlot, value: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  }

  function addSlot() {
    if (slots.length >= 5) return;
    const usedTypes = slots.map((s) => s.type);
    const nextType =
      (CONTENT_TYPES.find((t) => !usedTypes.includes(t.id))?.id as ContentTypeId) ??
      "other";
    setSlots((prev) => [
      ...prev,
      { id: Date.now(), type: nextType, text: "" },
    ]);
  }

  function removeSlot(id: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function buildSamplesString(): string {
    return slots
      .filter((s) => s.text.trim())
      .map((s) => {
        const label = CONTENT_TYPES.find((t) => t.id === s.type)?.label ?? "Sample";
        return `--- ${label} ---\n${s.text.trim()}`;
      })
      .join("\n\n");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    const combinedSamples = buildSamplesString();
    if (totalWords < 80) {
      toastT.error("toast.paste100Voice");
      return;
    }
    if (filledSlots.length < 1) {
      toastT.error("toast.paste100Voice");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        samples: combinedSamples,
        humanizationLevel,
        imperfectionMode,
        personalStoryInjection,
      });
      setName("");
      setSlots([
        { id: 1, type: "linkedin", text: "" },
        { id: 2, type: "twitter", text: "" },
        { id: 3, type: "blog", text: "" },
      ]);
      setHumanizationLevel("professional");
      setImperfectionMode(false);
      setPersonalStoryInjection(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (limit === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <p className="mb-3">
          Brand voice training is available on <strong>Pro</strong> and{" "}
          <strong>Agency</strong> plans.
        </p>
        <Button asChild>
          <Link href="/pricing">View plans</Link>
        </Button>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        You&apos;re using all {limit} brand voice{limit === 1 ? "" : "s"} on your plan.
        Delete one below or upgrade to add more.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Voice name */}
      <div>
        <Label htmlFor="voice-name" className="text-sm font-semibold">
          Voice name
        </Label>
        <Input
          id="voice-name"
          placeholder='e.g. "My LinkedIn tone" or "Startup blog"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1.5"
        />
      </div>

      {/* Quality bar + tips toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              Training quality
            </span>
            <span
              className={cn(
                "text-xs font-semibold",
                qualityPct >= 100
                  ? "text-emerald-600"
                  : qualityPct >= 50
                    ? "text-amber-500"
                    : "text-muted-foreground"
              )}
            >
              {totalWords} words total
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                qualityPct >= 100
                  ? "bg-emerald-500"
                  : qualityPct >= 50
                    ? "bg-amber-400"
                    : "bg-primary/40"
              )}
              style={{ width: `${qualityPct}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setTipsOpen((v) => !v)}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          Tips
          {tipsOpen ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>

      {tipsOpen && (
        <div className="rounded-xl bg-muted/50 border border-border/60 px-4 py-3 text-xs text-muted-foreground space-y-1.5">
          <p className="font-medium text-foreground">What makes great training data</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Use real posts you&apos;ve published — not drafts</li>
            <li>Mix short-form (Twitter) with long-form (LinkedIn/blog)</li>
            <li>Aim for 80+ words per sample for best results</li>
            <li>The more specific to your voice, the better the output</li>
            <li>Avoid generic samples — they produce generic AI output</li>
          </ul>
        </div>
      )}

      {/* Sample slots */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">
          Writing samples
          <span className="ml-1.5 text-xs text-muted-foreground font-normal">
            (paste real published content)
          </span>
        </Label>

        {slots.map((slot, idx) => {
          const words = countWords(slot.text);
          return (
            <div
              key={slot.id}
              className="rounded-xl border border-border/70 bg-card/60 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground w-5 shrink-0">
                  #{idx + 1}
                </span>
                <Select
                  value={slot.type}
                  onValueChange={(v) =>
                    updateSlot(slot.id, "type", v as ContentTypeId)
                  }
                >
                  <SelectTrigger className="h-7 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <SlotQuality words={words} />
                {slots.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    aria-label="Remove sample"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Textarea
                placeholder={
                  slot.type === "twitter"
                    ? "Paste a tweet, thread, or series of tweets you wrote…"
                    : slot.type === "linkedin"
                      ? "Paste a LinkedIn post you published…"
                      : slot.type === "blog"
                        ? "Paste a blog intro, section, or full post…"
                        : "Paste a writing sample from this format…"
                }
                value={slot.text}
                onChange={(e) => updateSlot(slot.id, "text", e.target.value)}
                className="min-h-[120px] text-sm resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              />
            </div>
          );
        })}

        {slots.length < 5 && (
          <button
            type="button"
            onClick={addSlot}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another sample (up to 5)
          </button>
        )}
      </div>

      {/* Authenticity tuning */}
      <div className="space-y-4 rounded-xl border border-border/70 p-4 bg-muted/20">
        <h4 className="text-sm font-semibold">Authenticity tuning</h4>
        <div>
          <Label className="text-xs text-muted-foreground">Humanization level</Label>
          <Select
            value={humanizationLevel}
            onValueChange={(v) => setHumanizationLevel(v as HumanizationLevel)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HUMANIZATION_LEVELS.map((l) => (
                <SelectItem key={l.id} value={l.id} title={l.description}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-muted-foreground">
            Casual ↔ Professional ↔ Raw / unfiltered
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm">Imperfection mode</Label>
            <p className="text-xs text-muted-foreground">
              Fragments, lowercase, relaxed punctuation for a more human feel
            </p>
          </div>
          <Switch
            checked={imperfectionMode}
            onCheckedChange={setImperfectionMode}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm">Personal story injection</Label>
            <p className="text-xs text-muted-foreground">
              AI naturally weaves in &quot;I once…&quot; style anecdotes
            </p>
          </div>
          <Switch
            checked={personalStoryInjection}
            onCheckedChange={setPersonalStoryInjection}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 font-semibold shadow-md shadow-primary/20"
        >
          {submitting ? "Training AI…" : "Create voice"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
