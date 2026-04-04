// src/lib/social/posters/linkedin.ts
import { getToken, isTokenExpired } from "@/lib/social/token-store";
import type { PostResult }          from "@/lib/social/types";

/** Register upload + upload image to LinkedIn. Returns asset URN or null on failure. */
async function uploadImageToLinkedIn(imageUrl: string, accessToken: string, personId: string): Promise<string | null> {
  try {
    // Step 1: Register upload
    const registerRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
          owner: `urn:li:person:${personId}`,
          serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
        },
      }),
    });
    if (!registerRes.ok) return null;
    const registerData = await registerRes.json() as {
      value?: {
        asset?: string;
        uploadMechanism?: {
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"?: { uploadUrl?: string };
        };
      };
    };
    const uploadUrl = registerData.value?.uploadMechanism?.["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]?.uploadUrl;
    const assetUrn = registerData.value?.asset;
    if (!uploadUrl || !assetUrn) return null;

    // Step 2: Fetch image and upload
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBuffer = await imgRes.arrayBuffer();
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "image/jpeg" },
      body: imgBuffer,
    });
    if (!uploadRes.ok) return null;
    return assetUrn;
  } catch {
    return null;
  }
}

export async function postToLinkedIn(userId: string, text: string, imageUrl?: string): Promise<PostResult> {
  const token = await getToken(userId, "linkedin");
  if (!token) return { platform: "linkedin", success: false, error: "LinkedIn not connected" };
  if (isTokenExpired(token.tokenExpiresAt)) return { platform: "linkedin", success: false, error: "LinkedIn token expired. Go to Connections to reconnect." };
  try {
    let assetUrn: string | null = null;
    if (imageUrl) {
      assetUrn = await uploadImageToLinkedIn(imageUrl, token.accessToken, token.platformUserId);
    }

    const shareContent = assetUrn
      ? {
          shareCommentary: { text },
          shareMediaCategory: "IMAGE",
          media: [{ status: "READY", description: { text: "" }, media: assetUrn, title: { text: "" } }],
        }
      : {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        };

    // UGC Posts API — works on development tier without app verification
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${token.platformUserId}`,
        lifecycleState: "PUBLISHED",
        specificContent: { "com.linkedin.ugc.ShareContent": shareContent },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const errMsg = (err as { message?: string }).message ?? `LinkedIn API error ${response.status}`;
      return { platform: "linkedin", success: false, error: errMsg };
    }

    const data = await response.json().catch(() => ({}));
    const postId = (data as { id?: string }).id ?? response.headers.get("x-restli-id") ?? "";
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
