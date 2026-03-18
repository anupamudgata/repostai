"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Mic, Lock, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { PLANS, HUMANIZATION_LEVELS } from "@/config/constants";
import type { BrandVoice, HumanizationLevel } from "@/types";

export default function BrandVoicePage() {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [humanizationLevel, setHumanizationLevel] = useState<HumanizationLevel>("professional");
  const [imperfectionMode, setImperfectionMode] = useState(false);
  const [personalStoryInjection, setPersonalStoryInjection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);
  const [editHumanization, setEditHumanization] = useState<HumanizationLevel>("professional");
  const [editImperfection, setEditImperfection] = useState(false);
  const [editPersonalStory, setEditPersonalStory] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const supabase = createClient();

  const planConfig = userPlan === "agency"
    ? PLANS.AGENCY
    : userPlan === "pro"
      ? PLANS.PRO
      : PLANS.FREE;
  const maxVoices = planConfig.brandVoices;
  const canCreateVoice = maxVoices === 0 ? false : voices.length < maxVoices;

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    if (!canCreateVoice) {
      if (maxVoices === 0) {
        toast.error("Brand voices are available on Pro and Agency plans.");
      } else {
        toast.error(`You've reached the limit of ${maxVoices} brand voices for your plan.`);
      }
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("brand_voices").insert({
      user_id: user.id,
      name,
      samples: sampleText,
      humanization_level: humanizationLevel,
      imperfection_mode: imperfectionMode,
      personal_story_injection: personalStoryInjection,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Brand voice created!");
      setName("");
      setSampleText("");
      setHumanizationLevel("professional");
      setImperfectionMode(false);
      setPersonalStoryInjection(false);
      setShowForm(false);
      loadVoices();
    }

    setLoading(false);
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
      toast.error(error.message);
    } else {
      toast.success("Authenticity settings updated");
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
      toast.error(error.message);
    } else {
      toast.success("Brand voice deleted");
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
        {maxVoices === 0 ? (
          <Button asChild variant="outline" className="gap-2">
            <Link href="/dashboard/settings">
              <Lock className="h-4 w-4" />
              Upgrade to Add Voices
            </Link>
          </Button>
        ) : (
          <Button
            onClick={() => {
              if (!canCreateVoice) {
                toast.error(`Limit reached (${maxVoices} voices for your plan).`);
                return;
              }
              setShowForm(!showForm);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Voice ({voices.length}/{maxVoices})
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Create Brand Voice</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="voice-name">Voice Name</Label>
                <Input
                  id="voice-name"
                  placeholder='e.g., "My LinkedIn Tone" or "Company Blog"'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sample">
                  Writing Sample (paste 3-5 examples of your writing)
                </Label>
                <Textarea
                  id="sample"
                  placeholder="Paste examples of your writing here. The more examples you provide, the better the AI will match your voice..."
                  className="min-h-[200px]"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste 3-5 examples of posts or articles you&apos;ve written.
                  The AI will learn your tone, vocabulary, and style.
                </p>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <h4 className="font-medium text-sm">Authenticity Tuning</h4>
                <div>
                  <Label className="text-xs">Humanization Level</Label>
                  <Select value={humanizationLevel} onValueChange={(v) => setHumanizationLevel(v as HumanizationLevel)}>
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
                  <p className="text-xs text-muted-foreground mt-1">Casual ↔ Professional ↔ Raw/Unfiltered</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Imperfection Mode</Label>
                    <p className="text-xs text-muted-foreground">Add typos, fragments, lowercase for vibe</p>
                  </div>
                  <Switch checked={imperfectionMode} onCheckedChange={setImperfectionMode} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Personal Story Injection</Label>
                    <p className="text-xs text-muted-foreground">AI adds relevant personal anecdotes</p>
                  </div>
                  <Switch checked={personalStoryInjection} onCheckedChange={setPersonalStoryInjection} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Voice"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
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
