import { getCachedTranscript, setCachedTranscript } from "@/lib/redis";

export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

const FETCH_TIMEOUT_MS = 15_000;

function fetchWithTimeout(input: string | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() =>
    clearTimeout(timer)
  );
}

export async function getYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  const cached = await getCachedTranscript(videoId);
  if (cached) return cached;

  const watchPageResponse = await fetchWithTimeout(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }
  );

  const html = await watchPageResponse.text();

  // Extract captions data from the page
  const captionsMatch = html.match(new RegExp('"captions":\\s*({.*?"captionTracks".*?})\\s*,\\s*"videoDetails"', "s"));
  if (!captionsMatch) {
    throw new Error(
      "No captions/transcript available for this video. Try a video with subtitles enabled, or paste the content manually."
    );
  }

  try {
    const captionsData = JSON.parse(captionsMatch[1]);
    const tracks = captionsData?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || tracks.length === 0) {
      throw new Error("No caption tracks found");
    }

    // Prefer English, fall back to first available
    const englishTrack = tracks.find(
      (t: { languageCode: string }) =>
        t.languageCode === "en" || t.languageCode.startsWith("en")
    );
    const track = englishTrack || tracks[0];

    const transcriptResponse = await fetchWithTimeout(track.baseUrl);
    const transcriptXml = await transcriptResponse.text();

    // Parse XML transcript
    const textSegments = transcriptXml.match(new RegExp("<text[^>]*>(.*?)</text>", "gs"));
    if (!textSegments) {
      throw new Error("Could not parse transcript");
    }

    const transcript = textSegments
      .map((segment) =>
        segment
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (transcript.length < 50) {
      throw new Error("Transcript too short to repurpose");
    }

    await setCachedTranscript(videoId, transcript);
    return transcript;
  } catch (e) {
    if (e instanceof Error && e.message.includes("Transcript")) throw e;
    throw new Error(
      "Could not extract transcript from this video. Try pasting the content manually."
    );
  }
}

export type TranscriptSegment = { text: string; start: number; dur: number };

/** Returns transcript with timestamps for clip extraction. */
export async function getYouTubeTranscriptWithTimestamps(url: string): Promise<TranscriptSegment[]> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  const watchPageResponse = await fetchWithTimeout(
    `https://www.youtube.com/watch?v=${videoId}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }
  );

  const html = await watchPageResponse.text();
  const captionsMatch = html.match(new RegExp('"captions":\\s*({.*?"captionTracks".*?})\\s*,\\s*"videoDetails"', "s"));
  if (!captionsMatch) {
    throw new Error(
      "No captions/transcript available for this video. Try a video with subtitles enabled."
    );
  }

  try {
    const captionsData = JSON.parse(captionsMatch[1]);
    const tracks = captionsData?.playerCaptionsTracklistRenderer?.captionTracks;
    if (!tracks || tracks.length === 0) {
      throw new Error("No caption tracks found");
    }

    const englishTrack = tracks.find(
      (t: { languageCode: string }) =>
        t.languageCode === "en" || t.languageCode.startsWith("en")
    );
    const track = englishTrack || tracks[0];

    const transcriptResponse = await fetchWithTimeout(track.baseUrl);
    const transcriptXml = await transcriptResponse.text();

    const segmentRegex = /<text[^>]*start="([\d.]+)"[^>]*(?:dur="([\d.]+)")?[^>]*>([^<]*)<\/text>/gi;
    const segments: TranscriptSegment[] = [];
    let m;
    while ((m = segmentRegex.exec(transcriptXml)) !== null) {
      const start = parseFloat(m[1]);
      const dur = m[2] ? parseFloat(m[2]) : 3;
      const text = m[3]
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
      if (text) segments.push({ text, start, dur });
    }

    if (segments.length === 0) {
      const fallbackRegex = /<text[^>]*start="([\d.]+)"[^>]*>([^<]*)<\/text>/gi;
      const fallbackMatches = [...transcriptXml.matchAll(fallbackRegex)];
      let prevStart = 0;
      for (const fm of fallbackMatches) {
        const start = parseFloat(fm[1]);
        const text = fm[2]
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, " ")
          .trim();
        if (text) {
          segments.push({ text, start, dur: Math.max(1, start - prevStart) });
          prevStart = start;
        }
      }
    }

    if (segments.length < 2) {
      throw new Error("Transcript too short for clip extraction");
    }

    return segments;
  } catch (e) {
    if (e instanceof Error && e.message.includes("Transcript")) throw e;
    throw new Error(
      "Could not extract transcript from this video. Try a video with subtitles enabled."
    );
  }
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
