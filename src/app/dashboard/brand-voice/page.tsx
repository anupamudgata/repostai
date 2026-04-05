"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Mic, Settings2, Sparkles, RefreshCw, Brain, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrandVoiceTrainingForm,
  type BrandVoiceTrainingPayload,
} from "@/components/dashboard/BrandVoiceTrainingForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useAppToast } from "@/hooks/use-app-toast";
import { PLANS, HUMANIZATION_LEVELS } from "@/config/constants";
import type { BrandVoice, HumanizationLevel } from "@/types";
import { cn } from "@/lib/utils";
import { BrandVoicePreviewPanel } from "@/components/dashboard/BrandVoicePreviewPanel";

interface VoiceWithPersona extends BrandVoice {
  persona?: string | null;
  persona_generated_at?: string | null;
  samples_hash?: string | null;
}

/** After this, if persona is still missing, show retry (warm may have failed). */
const TRAIN_GRACE_MS = 3 * 60 * 1000;

export default function BrandVoicePage() {
  const toastT = useAppToast();
  const [voices, setVoices] = useState<VoiceWithPersona[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVoice, setEditingVoice] = useState<VoiceWithPersona | null>(null);
  const [editHumanization, setEditHumanization] = useState<HumanizationLevel>("professional");
  const [editImperfection, setEditImperfection] = useState(false);
  const [editPersonalStory, setEditPersonalStory] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [fingerprintDialogVoice, setFingerprintDialogVoice] = useState<VoiceWithPersona | null>(null);
  const [trainingVoiceId, setTrainingVoiceId] = useState<string | null>(null);
  const supabase = createClient();

  const planConfig =
    userPlan === "agency"
      ? PLANS.AGENCY
      : userPlan === "pro"
        ? PLANS.PRO
        : userPlan === "starter"
          ? PLANS.STARTER
          : PLANS.FREE;
  const maxVoices = planConfig.brandVoices;
  const canCreateVoice = voices.length < maxVoices;

  useEffect(() => {
    loadVoices();
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setUserPlan(d.plan); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadVoices() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("brand_voices")
      .select("*, persona, persona_generated_at, samples_hash")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setVoices(data);
  }

  async function handleVoiceTraining(payload: BrandVoiceTrainingPayload) {
    const res = await fetch("/api/brand-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        samples: payload.samples,
        humanization_level: payload.humanizationLevel,
        imperfection_mode: payload.imperfectionMode,
        personal_story_injection: payload.personalStoryInjection,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toastT.errorFromApi({ error: data.error, code: data.code }, "toast.couldNotCreateBrandVoice");
      throw new Error(data.error || "create failed");
    }
    toastT.success("toast.brandVoiceCreatedExclaim");
    setShowForm(false);
    loadVoices();
  }

  async function handleUpdateAuthenticity() {
    if (!editingVoice) return;
    setLoading(true);
    const { error } = await supabase
      .from("brand_voices")
      .update({
        humanization_level: editHumanization,
        imperfection_mode: editImperfection,
        personal_story_injection: editPersonalStory,
      })
      .eq("id", editingVoice.id);
    setLoading(false);
    if (error) {
      toastT.errorFromApi({ error: error.message });
    } else {
      toastT.success("toast.authenticityUpdated");
      setEditingVoice(null);
      loadVoices();
    }
  }

  function openEditDialog(voice: VoiceWithPersona) {
    setEditingVoice(voice);
    setEditHumanization((voice.humanization_level as HumanizationLevel) || "professional");
    setEditImperfection(voice.imperfection_mode ?? false);
    setEditPersonalStory(voice.personal_story_injection ?? false);
  }

  async function handleTrainRetry(voiceId: string) {
    setTrainingVoiceId(voiceId);
    try {
      const res = await fetch(`/api/brand-voice/${voiceId}/train`, { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toastT.errorFromApi({ error: data.error }, "toast.brandVoiceTrainFailed");
        return;
      }
      toastT.success("toast.brandVoiceTrained");
      await loadVoices();
    } catch {
      toastT.error("toast.networkErrorShort");
    } finally {
      setTrainingVoiceId(null);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase
      .from("brand_voices")
      .delete()
      .eq("id", id);

    if (error) {
      toastT.errorFromApi({ error: error.message });
    } else {
      toastT.success("toast.brandVoiceDeleted");
      setVoices((prev) => prev.filter((v) => v.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Brand Voice
          </h1>
          <p className="text-muted-foreground mt-1">
            Train the AI on your real writing — it learns your tone, rhythm, and vocabulary.
          </p>
        </div>
        <Button
          onClick={() => {
            if (!canCreateVoice) {
              toastT.error("toast.limitVoicesReached", { max: maxVoices });
              return;
            }
            setShowForm(!showForm);
          }}
          className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-md shadow-primary/20 font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Voice
          <span className="text-xs opacity-70">({voices.length}/{maxVoices})</span>
        </Button>
      </div>

      {/* Training form */}
      {showForm && (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Create brand voice
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Paste real published writing — the AI copies your tone, pacing, and vocabulary.
            </p>
          </div>
          <div className="p-6">
            <BrandVoiceTrainingForm
              existingVoices={voices}
              limit={maxVoices}
              onSubmit={handleVoiceTraining}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {voices.length === 0 && !showForm ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Mic className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No brand voices yet</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-xs mx-auto">
            Add real writing samples and the AI will learn to post exactly like you.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-md shadow-primary/20 font-semibold"
          >
            <Plus className="h-4 w-4" />
            Create Your First Voice
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {voices.map((voice) => {
            const hasPersona = !!voice.persona;
            const trainedAgo = voice.persona_generated_at
              ? new Date(voice.persona_generated_at).toLocaleDateString()
              : null;
            const createdMs = new Date(voice.created_at).getTime();
            const pastGrace = Number.isFinite(createdMs) && Date.now() - createdMs > TRAIN_GRACE_MS;
            const trainStuck = !hasPersona && pastGrace;
            const isTrainingThis = trainingVoiceId === voice.id;

            return (
              <div
                key={voice.id}
                className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                {/* Card header */}
                <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center shrink-0">
                      <Mic className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{voice.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(voice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasPersona ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1"
                      >
                        <Sparkles className="h-2.5 w-2.5" />
                        AI Trained
                      </Badge>
                    ) : trainStuck ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive border-destructive/20 gap-1"
                      >
                        <AlertCircle className="h-2.5 w-2.5" />
                        Couldn&apos;t train
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        Training…
                      </Badge>
                    )}
                    {trainStuck && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] px-2 shrink-0"
                        disabled={isTrainingThis}
                        onClick={() => handleTrainRetry(voice.id)}
                      >
                        {isTrainingThis ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          "Retry"
                        )}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(voice)}
                      title="Authenticity settings"
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(voice.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Card body — show persona if available, else raw samples */}
                <div className="p-4">
                  {hasPersona ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary/70">
                        AI Voice Fingerprint
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                        {voice.persona}
                      </p>
                      {trainedAgo && (
                        <p className="text-xs text-muted-foreground/60">
                          Trained {trainedAgo}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2 h-8 text-xs"
                        onClick={() => setFingerprintDialogVoice(voice)}
                      >
                        Read full fingerprint
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground line-clamp-4 italic">
                      {voice.samples ?? voice.sample_text ?? "No samples yet"}
                    </p>
                  )}

                  {/* Tuning badges */}
                  <div
                    className={cn(
                      "flex flex-wrap gap-1.5",
                      (voice.imperfection_mode ||
                        voice.personal_story_injection ||
                        (voice.humanization_level &&
                          voice.humanization_level !== "professional")) &&
                        "mt-3"
                    )}
                  >
                    {voice.humanization_level &&
                      voice.humanization_level !== "professional" && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border/60 capitalize">
                          {voice.humanization_level}
                        </span>
                      )}
                    {voice.imperfection_mode && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border/60">
                        Imperfection
                      </span>
                    )}
                    {voice.personal_story_injection && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border/60">
                        Stories
                      </span>
                    )}
                  </div>

                  <BrandVoicePreviewPanel voiceId={voice.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!fingerprintDialogVoice} onOpenChange={(open) => !open && setFingerprintDialogVoice(null)}>
        <DialogContent className="rounded-2xl max-h-[85vh] flex flex-col sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Voice fingerprint — {fingerprintDialogVoice?.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 -mr-1 min-h-0 flex-1">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {fingerprintDialogVoice?.persona ?? ""}
            </pre>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFingerprintDialogVoice(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Authenticity edit dialog */}
      <Dialog
        open={!!editingVoice}
        onOpenChange={(open) => {
          if (!open) {
            setEditingVoice(null);
            requestAnimationFrame(() => {
              document.body.style.removeProperty("overflow");
              document.body.style.removeProperty("padding-right");
              document.documentElement.style.removeProperty("overflow");
            });
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Authenticity Tuning — {editingVoice?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Humanization Level</Label>
              <Select
                value={editHumanization}
                onValueChange={(v) => setEditHumanization(v as HumanizationLevel)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HUMANIZATION_LEVELS.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Imperfection Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Fragments, lowercase, relaxed punctuation for vibe
                </p>
              </div>
              <Switch
                checked={editImperfection}
                onCheckedChange={setEditImperfection}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Personal Story Injection</Label>
                <p className="text-xs text-muted-foreground">
                  AI adds relevant anecdotes naturally
                </p>
              </div>
              <Switch
                checked={editPersonalStory}
                onCheckedChange={setEditPersonalStory}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVoice(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAuthenticity} disabled={loading}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
