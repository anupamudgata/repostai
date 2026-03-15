"use client";

import { useState, useEffect } from "react";

interface BrandVoice {
  id: string;
  name: string;
  samplesLength: number;
  hasCachedPersona: boolean;
  createdAt: string;
  updatedAt: string;
}

export function BrandVoiceManager() {
  const [voices, setVoices]     = useState<BrandVoice[]>([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName]   = useState("");
  const [newSamples, setNewSamples] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function loadVoices() {
    try {
      const res = await fetch("/api/brand-voice");
      const data = await res.json();
      setVoices(data.voices ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadVoices(); }, []);

  async function handleCreate() {
    if (!newName.trim() || !newSamples.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), samples: newSamples.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.voice) {
        setVoices((prev) => [{ ...data.voice, samplesLength: newSamples.trim().length, hasCachedPersona: false, updatedAt: data.voice.createdAt }, ...prev]);
        setNewName(""); setNewSamples(""); setShowForm(false);
      }
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/brand-voice?id=${id}`, { method: "DELETE" });
    setVoices((prev) => prev.filter((v) => v.id !== id));
  }

  if (loading) return <p style={{ fontSize: "13px", color: "#9CA3AF" }}>Loading brand voices...</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>Brand Voices</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ fontSize: "12px", fontWeight: 600, color: "#2563EB", background: "transparent", border: "none", cursor: "pointer" }}>
          {showForm ? "Cancel" : "+ New voice"}
        </button>
      </div>

      {showForm && (
        <div style={{ padding: "16px", border: "1px solid #E5E7EB", borderRadius: "12px", marginBottom: "14px", background: "#FAFAFA" }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Voice name (e.g. 'My LinkedIn voice')" style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", marginBottom: "10px", boxSizing: "border-box" }} />
          <textarea value={newSamples} onChange={(e) => setNewSamples(e.target.value)} placeholder="Paste 3-5 examples of your writing (min 100 characters)..." rows={5} style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
            <button onClick={handleCreate} disabled={creating || !newName.trim() || newSamples.trim().length < 100} style={{ padding: "7px 18px", borderRadius: "8px", border: "none", background: newName.trim() && newSamples.trim().length >= 100 ? "#1E3A5F" : "#E2E8F0", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
              {creating ? "Creating..." : "Create voice"}
            </button>
          </div>
        </div>
      )}

      {voices.length === 0 && !showForm && <p style={{ fontSize: "13px", color: "#9CA3AF" }}>No brand voices yet. Create one to match your writing style.</p>}

      {voices.map((voice) => (
        <div key={voice.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid #E5E7EB", borderRadius: "10px", marginBottom: "8px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{voice.name}</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
              {voice.samplesLength.toLocaleString()} chars
              {voice.hasCachedPersona && <span style={{ color: "#10B981", marginLeft: "8px" }}>✓ Persona cached</span>}
            </div>
          </div>
          <button onClick={() => handleDelete(voice.id)} style={{ fontSize: "11px", color: "#EF4444", background: "transparent", border: "none", cursor: "pointer", fontWeight: 500 }}>Delete</button>
        </div>
      ))}
    </div>
  );
}
