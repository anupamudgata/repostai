// src/lib/social/posters/linkedin.ts
import { getToken, isTokenExpired } from "@/lib/social/token-store";
import type { PostResult }          from "@/lib/social/types";

export async function postToLinkedIn(userId: string, text: string): Promise<PostResult> {
  const token = await getToken(userId, "linkedin");
  if (!token) return { platform: "linkedin", success: false, error: "LinkedIn not connected" };
  if (isTokenExpired(token.tokenExpiresAt)) return { platform: "linkedin", success: false, error: "LinkedIn token expired. Please reconnect." };
  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0", "linkedin-version": "202502" },
      body: JSON.stringify({
        author: `urn:li:person:${token.platformUserId}`,
        lifecycleState: "PUBLISHED",
        specificContent: { "com.linkedin.ugc.ShareContent": { shareCommentary: { text }, shareMediaCategory: "NONE" } },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    if (!response.ok) { const err = await response.json().catch(() => ({})); return { platform: "linkedin", success: false, error: err.message ?? `LinkedIn API error ${response.status}` }; }
    const data = await response.json();
    const postId = data.id ?? "";
    return { platform: "linkedin", success: true, postId, postUrl: `https://www.linkedin.com/feed/update/${postId}` };
  } catch (err) {
    return { platform: "linkedin", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
