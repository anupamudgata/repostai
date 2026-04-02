// src/lib/social/posters/linkedin.ts
import { getToken, isTokenExpired } from "@/lib/social/token-store";
import type { PostResult }          from "@/lib/social/types";

export async function postToLinkedIn(userId: string, text: string): Promise<PostResult> {
  const token = await getToken(userId, "linkedin");
  if (!token) return { platform: "linkedin", success: false, error: "LinkedIn not connected" };
  if (isTokenExpired(token.tokenExpiresAt)) return { platform: "linkedin", success: false, error: "LinkedIn token expired. Please reconnect." };
  try {
    // Use the newer Posts API (ugcPosts is deprecated and being shut down)
    const response = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202501",
      },
      body: JSON.stringify({
        author: `urn:li:person:${token.platformUserId}`,
        commentary: text,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const errMsg = (err as { message?: string }).message ?? `LinkedIn API error ${response.status}`;
      return { platform: "linkedin", success: false, error: errMsg };
    }

    // The Posts API returns the post ID in the x-restli-id header
    const postId = response.headers.get("x-restli-id") ?? "";
    return {
      platform: "linkedin",
      success: true,
      postId,
      postUrl: postId ? `https://www.linkedin.com/feed/update/${postId}` : undefined,
    };
  } catch (err) {
    return { platform: "linkedin", success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}
