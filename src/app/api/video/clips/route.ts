import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getYouTubeTranscriptWithTimestamps,
  extractYouTubeVideoId,
  formatTimestamp,
} from "@/lib/scrapers/youtube-scraper";
import { openai } from "@/lib/ai/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const url = body.url as string | undefined;
    const transcript = body.transcript as string | undefined;

    let videoId: string | null = url?.trim() ? extractYouTubeVideoId(url.trim()) : null;

    let segments: { text: string; start: number; dur: number }[];

    if (transcript?.trim()) {
      // Parse pasted transcript with timestamps: [M:SS] or [H:MM:SS] text
      const lines = transcript.trim().split(/\n/);
      const parsed: { text: string; start: number; dur: number }[] = [];
      const timeRegex = /^\[(\d+):(\d+)(?::(\d+))?\]\s*(.*)$/;
      let prevStart = 0;
      for (const line of lines) {
        const m = line.match(timeRegex);
        if (m) {
          const hours = m[3] !== undefined ? parseInt(m[1]!, 10) : 0;
          const mins = m[3] !== undefined ? parseInt(m[2]!, 10) : parseInt(m[1]!, 10);
          const secs = m[3] !== undefined ? parseInt(m[3]!, 10) : parseInt(m[2]!, 10);
          const start = hours * 3600 + mins * 60 + secs;
          const text = (m[4] ?? "").trim();
          if (text) {
            parsed.push({ text, start, dur: Math.max(1, start - prevStart) });
            prevStart = start;
          }
        }
      }
      if (parsed.length < 2) {
        return NextResponse.json(
          { error: "Could not parse enough timestamps. Use format [M:SS] or [H:MM:SS] followed by text, one per line." },
          { status: 400 }
        );
      }
      segments = parsed;
      if (!videoId) videoId = "pasted";
    } else if (!url?.trim()) {
      return NextResponse.json({ error: "YouTube URL or transcript is required" }, { status: 400 });
    } else {
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
      }
      let segs;
      try {
        segs = await getYouTubeTranscriptWithTimestamps(url.trim());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("No captions") || msg.includes("No caption tracks") || msg.includes("Transcript too short")) {
        return NextResponse.json(
          { error: "No captions or transcript available for this video. Switch to \"Paste transcript\" and copy the transcript from YouTube (CC → Transcript), or try a different video with subtitles enabled." },
          { status: 400 }
        );
      }
      if (msg.includes("Invalid YouTube URL")) {
        return NextResponse.json({ error: "Invalid YouTube URL. Use a link like youtube.com/watch?v=..." }, { status: 400 });
      }
      if (msg.includes("AbortError") || msg.includes("aborted") || msg.includes("timeout")) {
        return NextResponse.json(
          { error: "The video took too long to load. Try again or use a different video." },
          { status: 400 }
        );
      }
      if (msg.includes("Could not extract") || msg.includes("Could not parse")) {
        return NextResponse.json(
          { error: "Could not extract transcript from this video. Ensure the video has captions enabled and is publicly accessible." },
          { status: 400 }
        );
      }
      if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        return NextResponse.json(
          { error: "Could not reach YouTube. The video may be private, age-restricted, or unavailable. Try a different video." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: msg || "Could not process this video. Try a video with subtitles enabled." },
        { status: 400 }
      );
    }
      segments = segs;
    }

    const transcriptWithTime = segments
      .map((s) => `[${formatTimestamp(s.start)}] ${s.text}`)
      .join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are a viral clip strategist. Analyze a video transcript with timestamps and identify 3-8 clip-worthy moments.
Return ONLY valid JSON, no markdown. Format:
{
  "clips": [
    {
      "startTime": 45,
      "endTime": 120,
      "reason": "1 sentence why this moment is clip-worthy",
      "hook": "First 1-2 lines to grab attention (spoken or on-screen text)",
      "caption": "Full TikTok/Reels caption with hashtags (150-300 chars)",
      "suggestedLength": "15-60" | "60-90" | "90-180"
    }
  ]
}
Rules:
- startTime/endTime in seconds. Clips should be 15-180 seconds. Prefer 30-90 for viral potential.
- Pick moments with: strong hooks, key insights, emotional peaks, quotable lines, "wait for it" payoffs.
- Spread clips across the video. Don't overlap.
- hook: The opening line that stops the scroll. Can be a question, bold claim, or tease.
- caption: TikTok/Reels style. Include 3-5 relevant hashtags. Casual, engaging tone.
- suggestedLength: "15-60" for quick hooks, "60-90" for standard, "90-180" for story beats.`,
        },
        {
          role: "user",
          content: `Transcript with timestamps (format [M:SS] text):\n\n${transcriptWithTime}\n\nIdentify the best clip moments.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    let parsed: { clips?: Array<{ startTime: number; endTime: number; reason: string; hook: string; caption: string; suggestedLength: string }> };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

    const clips = (parsed.clips ?? []).map((c) => ({
      ...c,
      startFormatted: formatTimestamp(c.startTime),
      endFormatted: formatTimestamp(c.endTime),
      youtubeUrl: videoId && videoId !== "pasted"
        ? `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(c.startTime)}`
        : `#t=${Math.floor(c.startTime)}`,
    }));

    return NextResponse.json({
      videoId: videoId ?? "pasted",
      videoUrl: videoId && videoId !== "pasted" ? `https://www.youtube.com/watch?v=${videoId}` : "",
      clips,
    });
  } catch (error) {
    console.error("Video clips error:", error);
    const msg = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
