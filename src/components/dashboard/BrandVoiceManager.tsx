"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppToast } from "@/hooks/use-app-toast";
import { PLANS } from "@/config/constants";
import {
  BrandVoiceTrainingForm,
  type BrandVoiceTrainingPayload,
} from "@/components/dashboard/BrandVoiceTrainingForm";

interface BrandVoiceRow {
  id: string;
  name: string;
  samplesLength: number;
  hasCachedPersona: boolean;
  createdAt: string;
  updatedAt: string;
}

export function BrandVoiceManager() {
  const toastT = useAppToast();
  const [voices, setVoices] = useState<BrandVoiceRow[]>([]);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const limit = useMemo(() => {
    if (userPlan === "agency") return PLANS.AGENCY.brandVoices;
    if (userPlan === "pro") return PLANS.PRO.brandVoices;
    return PLANS.FREE.brandVoices;
  }, [userPlan]);

  async function loadVoices() {
    try {
      const res = await fetch("/api/brand-voice");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setVoices(data.voices ?? []);
    } catch (e) {
      if (e instanceof Error && e.message) {
        toastT.errorFromApi({ error: e.message });
      } else {
        toastT.error("toast.couldNotLoadBrandVoices");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) setUserPlan(d.plan);
      })
      .catch(() => {});
    loadVoices();
  }, []);

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
      toastT.errorFromApi(
        { error: data.error, code: data.code },
        "toast.couldNotCreateBrandVoice"
      );
      throw new Error(data.error || "create failed");
    }
    toastT.success("toast.brandVoiceCreated");
    setShowForm(false);
    await loadVoices();
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/brand-voice?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toastT.error("toast.couldNotDelete");
      return;
    }
    setVoices((prev) => prev.filter((v) => v.id !== id));
    toastT.success("toast.brandVoiceRemoved");
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading brand voices…</p>;
  }

  const existingForForm = voices.map((v) => ({ id: v.id, name: v.name }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Brand voices</h3>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {showForm ? "Cancel" : "+ New voice"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-lg border bg-muted/20 p-4">
          <BrandVoiceTrainingForm
            existingVoices={existingForForm}
            limit={limit}
            onSubmit={handleVoiceTraining}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {voices.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">
          No brand voices yet. Add samples so repurposed posts match how you write.
        </p>
      )}

      <ul className="space-y-2">
        {voices.map((voice) => (
          <li
            key={voice.id}
            className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{voice.name}</div>
              <div className="text-xs text-muted-foreground">
                {voice.samplesLength.toLocaleString()} chars
                {voice.hasCachedPersona && (
                  <span className="ml-2 text-emerald-600">Persona ready</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(voice.id)}
              className="shrink-0 text-xs font-medium text-destructive hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
