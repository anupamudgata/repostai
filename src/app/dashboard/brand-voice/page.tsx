"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Mic, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { PLANS } from "@/config/constants";
import type { BrandVoice } from "@/types";

export default function BrandVoicePage() {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [loading, setLoading] = useState(false);
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
      sample_text: sampleText,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Brand voice created!");
      setName("");
      setSampleText("");
      setShowForm(false);
      loadVoices();
    }

    setLoading(false);
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
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(voice.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {voice.sample_text}
                </p>
                <p className="text-xs text-muted-foreground mt-3">
                  Created {new Date(voice.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
