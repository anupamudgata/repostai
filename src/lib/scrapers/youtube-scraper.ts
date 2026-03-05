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

export async function getYouTubeTranscript(url: string): Promise<string> {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  // Fetch transcript using YouTube's internal API (no API key needed)
  const watchPageResponse = await fetch(
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

    const transcriptResponse = await fetch(track.baseUrl);
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

    return transcript;
  } catch (e) {
    if (e instanceof Error && e.message.includes("Transcript")) throw e;
    throw new Error(
      "Could not extract transcript from this video. Try pasting the content manually."
    );
  }
}
