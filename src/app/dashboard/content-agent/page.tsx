"use client";

import { useState } from "react";
import { SUPPORTED_LANGUAGES } from "@/config/constants";
import type { OutputLanguage } from "@/types";

const TONES   = ["Professional", "Casual", "Humorous", "Inspirational", "Educational"] as const;
const LENGTHS = ["Short (300 words)", "Medium (600 words)", "Long (1000+ words)"] as const;

const EXAMPLE_TOPICS = [
  { topic: "How I grew my LinkedIn from 0 to 5K followers in 6 months", tone: "Professional", audience: "Content creators and marketers" },
  { topic: "5 mistakes I made as a first-time founder",                  tone: "Casual",       audience: "Early-stage founders" },
  { topic: "Why most social media advice is dead wrong",                 tone: "Inspirational", audience: "Business owners spending time on social" },
];

type Step = "input" | "generating" | "done";

export default function ContentAgentPage() {
  const [step,     setStep]     = useState<Step>("input");
  const [topic,    setTopic]    = useState("");
  const [tone,     setTone]     = useState<typeof TONES[number]>("Professional");
  const [length,   setLength]   = useState<typeof LENGTHS[number]>("Medium (600 words)");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState<OutputLanguage>("en");
  const [result,   setResult]   = useState<{ draft: string; jobId: string } | null>(null);
  const [error,    setError]    = useState("");
  const [progress, setProgress] = useState(0);

  function fillExample(ex: typeof EXAMPLE_TOPICS[number]) {
    setTopic(ex.topic);
    setTone(ex.tone as typeof TONES[number]);
    setAudience(ex.audience);
  }

  async function handleGenerate() {
    if (!topic.trim() || !audience.trim()) return;
    setStep("generating");
    setError("");
    setProgress(10);

    const interval = setInterval(
      () => setProgress((p) => Math.min(p + 8, 90)),
      400
    );

    try {
      const res = await fetch("/api/content-agent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ topic, tone: tone.toLowerCase(), length, audience, language }),
      });
      clearInterval(interval);
      setProgress(100);
      if (!res.ok) {
        const d = await res.json();
        throw new Error((d as { error?: string }).error ?? "Generation failed");
      }
      const data = await res.json() as { draft: string; jobId: string };
      setResult(data);
      setStep("done");
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("input");
      setProgress(0);
    }
  }

  return (
    <div style={{
      minHeight:  "100vh",
      background: "#F9FAFB",
      padding:    "40px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginBottom: "6px" }}>
            Content Agent
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
            Give it a topic, tone, and audience — it writes a full draft then repurposes
            it for all 7 platforms automatically.
          </p>
        </div>

        {step === "input" && (
          <>
            {/* How it works */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginBottom: "24px" }}>
              {[
                { n: "1", title: "Describe your idea",    desc: "Topic, tone, target audience"       },
                { n: "2", title: "AI writes the draft",   desc: "Full blog-quality post in your tone" },
                { n: "3", title: "Auto-repurposed",       desc: "7 platforms generated instantly"     },
              ].map((s) => (
                <div key={s.n} style={{ background: "#FFFFFF", border: "0.5px solid #E5E7EB", borderRadius: "10px", padding: "14px" }}>
                  <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#1E3A5F", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    {s.n}
                  </div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "3px" }}>{s.title}</p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Example topics */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "8px" }}>
                Try an example
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                {EXAMPLE_TOPICS.map((ex) => (
                  <button
                    key={ex.topic}
                    onClick={() => fillExample(ex)}
                    style={{ padding: "11px 14px", borderRadius: "10px", border: "0.5px solid #E5E7EB", background: "#FFFFFF", textAlign: "left", cursor: "pointer" }}
                  >
                    {/* FIX: replaced raw " with &ldquo; and &rdquo; */}
                    <p style={{ fontSize: "13px", fontWeight: 500, color: "#111827", marginBottom: "3px" }}>
                      &ldquo;{ex.topic}&rdquo;
                    </p>
                    <div style={{ display: "flex", gap: "7px" }}>
                      <span style={{ fontSize: "11px", color: "#2563EB", background: "#EFF6FF", padding: "1px 7px", borderRadius: "4px" }}>{ex.tone}</span>
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>for {ex.audience}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "14px", padding: "20px" }}>

              {/* Topic */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Topic *</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What do you want to write about? Be specific."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", lineHeight: 1.6, color: "#111827", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                />
              </div>

              {/* Tone + Length */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as typeof TONES[number])}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", color: "#111827", outline: "none", background: "#FFFFFF", boxSizing: "border-box" }}
                  >
                    {TONES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Length</label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value as typeof LENGTHS[number])}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", color: "#111827", outline: "none", background: "#FFFFFF", boxSizing: "border-box" }}
                  >
                    {LENGTHS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Target audience *</label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Early-stage SaaS founders, fitness beginners"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", color: "#111827", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Language */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Output language</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLanguage(lang.id as OutputLanguage)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "7px",
                        border:
                          language === lang.id ? "1.5px solid #1E3A5F" : "1px solid #E5E7EB",
                        background: language === lang.id ? "#EFF6FF" : "transparent",
                        color: language === lang.id ? "#1E3A5F" : "#6B7280",
                        fontSize: "12px",
                        fontWeight: language === lang.id ? 600 : 400,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ marginRight: "4px" }}>{lang.flag}</span>
                      {lang.nativeName}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p style={{ fontSize: "13px", color: "#DC2626", marginBottom: "12px" }}>{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={!topic.trim() || !audience.trim()}
                style={{ width: "100%", padding: "12px", borderRadius: "9px", border: "none", background: !topic.trim() || !audience.trim() ? "#E5E7EB" : "#1E3A5F", color: !topic.trim() || !audience.trim() ? "#9CA3AF" : "#FFFFFF", fontSize: "14px", fontWeight: 700, cursor: !topic.trim() || !audience.trim() ? "not-allowed" : "pointer" }}
              >
                Generate content week →
              </button>
            </div>
          </>
        )}

        {step === "generating" && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "50%", border: "3px solid #EFF6FF", borderTop: "3px solid #2563EB", animation: "spin .8s linear infinite", margin: "0 auto 20px" }} />
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>Writing your content...</h2>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px" }}>Generating full draft then repurposing for all 7 platforms</p>
            <div style={{ width: "240px", height: "4px", background: "#E5E7EB", borderRadius: "999px", overflow: "hidden", margin: "0 auto" }}>
              <div style={{ height: "4px", width: `${progress}%`, background: "#2563EB", borderRadius: "999px", transition: "width .4s ease" }} />
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {step === "done" && result && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>Your content is ready</h2>
              <button onClick={() => { setStep("input"); setResult(null); setProgress(0); }} style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "transparent", color: "#374151", fontSize: "13px", cursor: "pointer" }}>
                + New content
              </button>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "12px", padding: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: "10px" }}>Generated draft</p>
              <pre style={{ fontSize: "13px", lineHeight: 1.75, color: "#1E293B", whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", margin: 0 }}>
                {result.draft}
              </pre>
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "0.5px solid #F3F4F6" }}>
                <a href={`/dashboard/repurpose?jobId=${result.jobId}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", borderRadius: "8px", background: "#1E3A5F", color: "#FFFFFF", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
                  Repurpose to all platforms →
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
