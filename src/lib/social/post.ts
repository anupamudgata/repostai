import { postToLinkedIn } from "@/lib/social/posters/linkedin";
import { postToTwitter  } from "@/lib/social/posters/twitter";
import { postToFacebook } from "@/lib/social/posters/facebook";
import { postToReddit   } from "@/lib/social/posters/reddit";
import { postToTelegram } from "@/lib/social/posters/telegram";
import { captureError   } from "@/lib/sentry";
import type { Platform, PostResult } from "@/lib/social/types";

interface PostOptions { userId: string; platform: Platform; text: string; subreddit?: string; }

export async function postToPlatform(opts: PostOptions): Promise<PostResult> {
  const { userId, platform, text, subreddit } = opts;
  try {
    switch (platform) {
      case "linkedin":  return await postToLinkedIn(userId, text);
      case "twitter":   return await postToTwitter(userId, text);
      case "facebook":  return await postToFacebook(userId, text);
      case "reddit":    return await postToReddit(userId, text, subreddit ?? "");
      case "instagram": return { platform, success: false, error: "Instagram requires a photo. Use Photo Captions instead." };
      case "telegram":  return await postToTelegram(userId, text);
      default: return { platform, success: false, error: `Platform ${platform} not yet supported` };
    }
  } catch (err) {
    captureError(err, { userId, action: "social_post", extra: { platform } });
    return { platform, success: false, error: "Unexpected error posting. Our team has been notified." };
  }
}

export async function postToAllPlatforms(opts: { userId: string; posts: Array<{ platform: Platform; text: string; subreddit?: string }> }): Promise<PostResult[]> {
  const results = await Promise.allSettled(opts.posts.map((p) => postToPlatform({ userId: opts.userId, platform: p.platform, text: p.text, subreddit: p.subreddit })));
  return results.map((r, i) => r.status === "fulfilled" ? r.value : { platform: opts.posts[i]!.platform, success: false, error: "Failed to post" });
}
