import { getToken, upsertToken, isTokenExpired } from "@/lib/social/token-store";
import type { PostResult }                        from "@/lib/social/types";

async function refreshTwitterToken(userId: string, refreshToken: string): Promise<string | null> {
  const credentials = Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64");
  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${credentials}` },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
  });
  if (!response.ok) return null;
  const data = await response.json();
  await upsertToken(userId, "twitter", { accessToken: data.access_token, refreshToken: data.refresh_token, expiresInSeconds: data.expires_in, platformUserId: "" });
  return data.access_token;
}

/** Post a single tweet using a raw (decrypted) access token. */
export async function postToTwitterWithToken(text: string, accessToken: string): Promise<{ id: string }> {
  const tweetText = text.length > 280 ? text.slice(0, 277) + "..." : text;
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: tweetText }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { detail?: string })?.detail ?? `Twitter API error ${response.status}`);
  }
  const json = (await response.json()) as { data?: { id?: string } };
  return { id: json.data?.id ?? "" };
}

/**
 * Post a Twitter thread (multiple tweets as a reply chain).
 * Splits on double-newline or numbered "1/n" patterns.
 */
export async function postTwitterThread(accessToken: string, fullText: string): Promise<{ ids: string[]; firstId: string }> {
  // Split thread into individual tweets
  const tweets = splitIntoTweets(fullText);
  if (tweets.length === 0) throw new Error("No tweets to post");

  const ids: string[] = [];
  let replyToId: string | null = null;

  for (const tweet of tweets) {
    const body: Record<string, unknown> = { text: tweet };
    if (replyToId) {
      body.reply = { in_reply_to_tweet_id: replyToId };
    }
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { detail?: string })?.detail ?? `Twitter API error ${response.status}`);
    }
    const json = (await response.json()) as { data?: { id?: string } };
    const id = json.data?.id ?? "";
    ids.push(id);
    replyToId = id;
  }
  return { ids, firstId: ids[0] ?? "" };
}

/** Split thread text into individual <=280 char tweets. */
function splitIntoTweets(text: string): string[] {
  // Try splitting on common thread separators
  let parts: string[];

  // Check for numbered format: "1/n", "1.", "[1]", "Tweet 1:", etc.
  const numberedPattern = /(?:^|\n\n)(?:\d+[\/\.]\s*\d*\s*|(?:\[\d+\]\s*)|(?:Tweet\s*\d+:?\s*))/i;
  if (numberedPattern.test(text)) {
    parts = text.split(/\n\n(?=\d+[\/\.]\s*|\[\d+\]\s*|Tweet\s*\d+)/i).map((s) => {
      // Remove the numbering prefix
      return s.replace(/^\d+[\/\.]\s*\d*\s*|\[\d+\]\s*|Tweet\s*\d+:?\s*/i, "").trim();
    }).filter((s) => s.length > 0);
  } else if (text.includes("\n---\n") || text.includes("\n\n---\n\n")) {
    // Split on --- separators
    parts = text.split(/\n-{3,}\n/).map((s) => s.trim()).filter((s) => s.length > 0);
  } else {
    // Split on double newlines
    parts = text.split(/\n\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
  }

  // If we only got one part, try to split long text at sentence boundaries
  if (parts.length === 1 && parts[0]!.length > 280) {
    parts = splitLongText(parts[0]!, 280);
  }

  // Ensure each tweet is within 280 chars
  const result: string[] = [];
  for (const part of parts) {
    if (part.length <= 280) {
      result.push(part);
    } else {
      result.push(...splitLongText(part, 280));
    }
  }
  return result;
}

function splitLongText(text: string, maxLen: number): string[] {
  const result: string[] = [];
  let remaining = text;
  while (remaining.length > maxLen) {
    let splitIdx = remaining.lastIndexOf(". ", maxLen - 1);
    if (splitIdx < maxLen * 0.3) splitIdx = remaining.lastIndexOf(" ", maxLen - 1);
    if (splitIdx < maxLen * 0.3) splitIdx = maxLen - 3; // hard split
    result.push(remaining.slice(0, splitIdx + 1).trim());
    remaining = remaining.slice(splitIdx + 1).trim();
  }
  if (remaining) result.push(remaining);
  return result;
}

export async function postToTwitter(userId: string, text: string): Promise<PostResult> {
  const token = await getToken(userId, "twitter");
  if (!token) return { platform: "twitter", success: false, error: "Twitter not connected" };
  let accessToken = token.accessToken;
  if (isTokenExpired(token.tokenExpiresAt) && token.refreshToken) {
    const newToken = await refreshTwitterToken(userId, token.refreshToken);
    if (!newToken) return { platform: "twitter", success: false, error: "Twitter session expired. Please reconnect." };
    accessToken = newToken;
  }
  try {
    const tweet = await postToTwitterWithToken(text, accessToken);
    const postId = tweet.id;
    return { platform: "twitter", success: true, postId, postUrl: `https://x.com/${token.platformUsername}/status/${postId}` };
  } catch (err) {
    return { platform: "twitter", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/** Post a thread using the user's stored credentials. */
export async function postToTwitterThread(userId: string, text: string): Promise<PostResult> {
  const token = await getToken(userId, "twitter");
  if (!token) return { platform: "twitter", success: false, error: "Twitter not connected" };
  let accessToken = token.accessToken;
  if (isTokenExpired(token.tokenExpiresAt) && token.refreshToken) {
    const newToken = await refreshTwitterToken(userId, token.refreshToken);
    if (!newToken) return { platform: "twitter", success: false, error: "Twitter session expired. Please reconnect." };
    accessToken = newToken;
  }
  try {
    const result = await postTwitterThread(accessToken, text);
    return { platform: "twitter", success: true, postId: result.firstId, postUrl: `https://x.com/${token.platformUsername}/status/${result.firstId}` };
  } catch (err) {
    return { platform: "twitter", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
