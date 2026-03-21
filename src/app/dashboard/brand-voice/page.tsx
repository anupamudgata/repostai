"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Mic, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { brandVoiceWritingFields } from "@/lib/brand-voice-db";
import { useAppToast } from "@/hooks/use-app-toast";
import { PLANS, HUMANIZATION_LEVELS } from "@/config/constants";
import type { BrandVoice, HumanizationLevel } from "@/types";

export default function BrandVoicePage() {
  const toastT = useAppToast();
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);
  const [editHumanization, setEditHumanization] = useState<HumanizationLevel>("professional");
  const [editImperfection, setEditImperfection] = useState(false);
  const [editPersonalStory, setEditPersonalStory] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
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
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setVoices(data);
  }

  async function handleVoiceTraining(payload: BrandVoiceTrainingPayload) {
    if (!canCreateVoice) {
      toastT.error("toast.brandVoiceLimit", { max: maxVoices });
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("brand_voices").insert({
      user_id: user.id,
      name: payload.name,
      ...brandVoiceWritingFields(payload.samples),
      humanization_level: payload.humanizationLevel,
      imperfection_mode: payload.imperfectionMode,
      personal_story_injection: payload.personalStoryInjection,
    });

    if (error) {
      toastT.errorFromApi({ error: error.message });
    } else {
      toastT.success("toast.brandVoiceCreatedExclaim");
      setShowForm(false);
      loadVoices();
    }
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

  function openEditDialog(voice: BrandVoice) {
    setEditingVoice(voice);
    setEditHumanization((voice.humanization_level as HumanizationLevel) || "professional");
    setEditImperfection(voice.imperfection_mode ?? false);
    setEditPersonalStory(voice.personal_story_injection ?? false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Brand Voice</h1>
          <p className="text-muted-foreground mt-1">
            Train the AI to write in your unique style.
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
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Voice ({voices.length}/{maxVoices})
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create brand voice</CardTitle>
            <p className="text-sm text-muted-foreground">
              Paste real writing samples — the AI copies your tone, pacing, and vocabulary.
            </p>
          </CardHeader>
          <CardContent>
            <BrandVoiceTrainingForm
              existingVoices={voices}
              limit={maxVoices}
              onSubmit={handleVoiceTraining}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {voices.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No brand voices yet</h3>
            <p className="text-muted-foreground mb-4">
              Add writing samples so the AI matches your unique tone and style.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Voice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {voices.map((voice) => (
            <Card key={voice.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{voice.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(voice)}
                      title="Authenticity settings"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(voice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {voice.samples ?? voice.sample_text}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {voice.imperfection_mode && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">Imperfection</span>
                  )}
                  {voice.personal_story_injection && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted">Stories</span>
                  )}
                  {voice.humanization_level && voice.humanization_level !== "professional" && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted capitalize">{voice.humanization_level}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(voice.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingVoice} onOpenChange={(open) => !open && setEditingVoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Authenticity Tuning — {editingVoice?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Humanization Level</Label>
              <Select value={editHumanization} onValueChange={(v) => setEditHumanization(v as HumanizationLevel)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HUMANIZATION_LEVELS.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Imperfection Mode</Label>
                <p className="text-xs text-muted-foreground">Typos, fragments, lowercase for vibe</p>
              </div>
              <Switch checked={editImperfection} onCheckedChange={setEditImperfection} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Personal Story Injection</Label>
                <p className="text-xs text-muted-foreground">AI adds relevant anecdotes</p>
              </div>
              <Switch checked={editPersonalStory} onCheckedChange={setEditPersonalStory} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVoice(null)}>Cancel</Button>
            <Button onClick={handleUpdateAuthenticity} disabled={loading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
