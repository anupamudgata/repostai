// src/lib/social/types.ts
export type Platform = "linkedin" | "twitter" | "instagram" | "facebook" | "reddit";

export interface ConnectedAccount {
  id:               string;
  platform:         Platform;
  platformUserId:   string;
  platformUsername: string;
  platformAvatar:   string | null;
  tokenExpiresAt:   string | null;
  meta:             Record<string, unknown> | null;
}

export interface PostPayload { platform: Platform; text: string; userId: string; }
export interface PostResult  { platform: Platform; success: boolean; postId?: string; postUrl?: string; error?: string; }
