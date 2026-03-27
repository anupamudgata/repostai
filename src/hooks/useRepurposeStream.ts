"use client";

import { useState, useRef, useCallback } from "react";
import type { Platform, Language, ContentBrief }   from "@/lib/ai/types";

export type PlatformStatus = "idle" | "waiting" | "streaming" | "done" | "error";

export interface PlatformState {
  platform:    Platform;
  status:      PlatformStatus;
  content:     string;
  tweets?:     string[];
  subject?:    string;
  title?:      string;
  hashtags?:   string[];
  durationMs?: number;
  error?:      string;
}

export type StreamStatus = "idle" | "extracting" | "streaming" | "done" | "error";

export interface RepurposeStreamState {
  status:    StreamStatus;
  brief:     ContentBrief | null;
  platforms: Record<Platform, PlatformState>;
  totalMs:   number;
  remaining: number | null;
  error:     string;
  progress:  number;
}

interface StartParams {
  content:       string;
  platforms:     Platform[];
  language?:     Language;
  brandVoiceId?: string;
}

const DEFAULT_PLATFORM_STATE = (platform: Platform): PlatformState => ({ platform, status: "idle", content: "" });

export function useRepurposeStream() {
  const [state, setState] = useState<RepurposeStreamState>({
    status: "idle", brief: null, platforms: {} as Record<Platform, PlatformState>,
    totalMs: 0, remaining: null, error: "", progress: 0,
  });

  const abortRef = useRef<AbortController | null>(null);
  const doneRef  = useRef<Set<Platform>>(new Set());
  const totalRef = useRef<number>(0);

  const updatePlatform = useCallback((platform: Platform, update: Partial<PlatformState>) => {
    setState((prev) => ({ ...prev, platforms: { ...prev.platforms, [platform]: { ...prev.platforms[platform]!, ...update } } }));
  }, []);

  const start = useCallback(async (params: StartParams) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    doneRef.current  = new Set();
    totalRef.current = params.platforms.length;

    const initialPlatforms = Object.fromEntries(
      params.platforms.map((p) => [p, { ...DEFAULT_PLATFORM_STATE(p), status: "waiting" as PlatformStatus }])
    ) as Record<Platform, PlatformState>;

    setState({ status: "extracting", brief: null, platforms: initialPlatforms, totalMs: 0, remaining: null, error: "", progress: 5 });

    try {
      const response = await fetch("/api/repurpose/stream", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params), signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setState((prev) => ({ ...prev, status: "error", error: data.error ?? "Request failed" }));
        return;
      }

      const reader  = response.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let payload: Record<string, unknown>;
          try { payload = JSON.parse(line.slice(6)); } catch { continue; }

          const type     = payload.type     as string;
          const platform = payload.platform as Platform | undefined;

          switch (type) {
            case "brief_ready": {
              const resolved = payload.platforms as Platform[] | undefined;
              if (resolved?.length) {
                totalRef.current = resolved.length;
                doneRef.current = new Set();
                const nextPlatforms = Object.fromEntries(
                  resolved.map((p) => [p, { ...DEFAULT_PLATFORM_STATE(p), status: "waiting" as PlatformStatus }])
                ) as Record<Platform, PlatformState>;
                setState((prev) => ({
                  ...prev,
                  status: "streaming",
                  brief: payload.brief as ContentBrief,
                  platforms: nextPlatforms,
                  progress: 15,
                }));
              } else {
                setState((prev) => ({ ...prev, status: "streaming", brief: payload.brief as ContentBrief, progress: 15 }));
              }
              break;
            }
            case "platform_start":
              if (platform) updatePlatform(platform, { status: "streaming", content: "" });
              break;
            case "platform_chunk":
              if (platform) {
                setState((prev) => {
                  const current = prev.platforms[platform];
                  if (!current) return prev;
                  return { ...prev, platforms: { ...prev.platforms, [platform]: { ...current, content: current.content + (payload.chunk as string ?? "") } } };
                });
              }
              break;
            case "platform_done":
              if (platform) {
                doneRef.current.add(platform);
                const progress = 15 + Math.round((doneRef.current.size / totalRef.current) * 80);
                updatePlatform(platform, { status: "done", content: payload.content as string ?? "", tweets: payload.tweets as string[] | undefined, subject: payload.subject as string | undefined, title: payload.title as string | undefined, hashtags: payload.hashtags as string[] | undefined, durationMs: payload.durationMs as number | undefined });
                setState((prev) => ({ ...prev, progress }));
              }
              break;
            case "platform_error":
              if (platform) { doneRef.current.add(platform); updatePlatform(platform, { status: "error", error: payload.error as string }); }
              break;
            case "all_done":
              setState((prev) => ({ ...prev, status: "done", totalMs: payload.durationMs as number ?? 0, remaining: payload.remaining as number ?? null, progress: 100 }));
              break;
            case "error":
              setState((prev) => ({ ...prev, status: "error", error: payload.error as string ?? "Something went wrong" }));
              break;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({ ...prev, status: "error", error: "Network error. Please try again." }));
    }
  }, [updatePlatform]);

  const cancel = useCallback(() => { abortRef.current?.abort(); setState((prev) => ({ ...prev, status: "idle" })); }, []);
  const reset  = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: "idle", brief: null, platforms: {} as Record<Platform, PlatformState>, totalMs: 0, remaining: null, error: "", progress: 0 });
  }, []);

  return { state, start, cancel, reset };
}
