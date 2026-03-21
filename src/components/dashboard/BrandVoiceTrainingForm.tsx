"use client";

import { useState } from "react";
import Link from "next/link";
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

export type BrandVoiceTrainingPayload = {
  name: string;
  samples: string;
  humanizationLevel: HumanizationLevel;
  imperfectionMode: boolean;
  personalStoryInjection: boolean;
};

export interface BrandVoiceTrainingFormProps {
  /** Saved voices (used for count vs plan limit). */
  existingVoices: { id: string; name: string }[];
  /** Max voices for the user’s tier (e.g. Pro = 3, Agency = 10, Free = 0). */
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
  const [sampleText, setSampleText] = useState("");
  const [humanizationLevel, setHumanizationLevel] =
    useState<HumanizationLevel>("professional");
  const [imperfectionMode, setImperfectionMode] = useState(false);
  const [personalStoryInjection, setPersonalStoryInjection] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const count = existingVoices.length;
  const canCreate = limit > 0 && count < limit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    const samples = sampleText.trim();
    if (samples.length < 100) {
      toastT.error("toast.paste100Voice");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        samples,
        humanizationLevel,
        imperfectionMode,
        personalStoryInjection,
      });
      setName("");
      setSampleText("");
      setHumanizationLevel("professional");
      setImperfectionMode(false);
      setPersonalStoryInjection(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (limit === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
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
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        You&apos;re using all {limit} brand voice{limit === 1 ? "" : "s"} on your plan.
        Delete one below or upgrade to add more.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="voice-name">Voice name</Label>
        <Input
          id="voice-name"
          placeholder='e.g. "My LinkedIn tone" or "Company blog"'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="sample">
          Writing samples (paste 3–5 examples of your writing)
        </Label>
        <Textarea
          id="sample"
          placeholder="Paste posts or paragraphs you’ve published. More representative examples help the AI match your tone, vocabulary, and rhythm."
          className="mt-1 min-h-[200px]"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {count}/{limit} voices in use · aim for 100+ characters for best results
        </p>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h4 className="text-sm font-medium">Authenticity tuning</h4>
        <div>
          <Label className="text-xs">Humanization level</Label>
          <Select
            value={humanizationLevel}
            onValueChange={(v) => setHumanizationLevel(v as HumanizationLevel)}
          >
            <SelectTrigger className="mt-1">
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
              Typos, fragments, lowercase for a more human feel
            </p>
          </div>
          <Switch checked={imperfectionMode} onCheckedChange={setImperfectionMode} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="text-sm">Personal story injection</Label>
            <p className="text-xs text-muted-foreground">
              Allow anecdote-style lines where it fits
            </p>
          </div>
          <Switch
            checked={personalStoryInjection}
            onCheckedChange={setPersonalStoryInjection}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Create voice"}
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
