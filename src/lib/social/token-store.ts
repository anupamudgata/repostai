import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Platform }  from "@/lib/social/types";

export interface TokenRecord {
  accessToken:      string;
  refreshToken:     string | null;
  tokenExpiresAt:   string | null;
  platformUserId:   string;
  platformUsername: string | null;
  meta:             Record<string, unknown> | null;
}

export async function getToken(userId: string, platform: Platform): Promise<TokenRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("connected_accounts")
    .select("access_token, refresh_token, token_expires_at, platform_user_id, platform_username, meta")
    .eq("user_id", userId).eq("platform", platform).single();
  if (error || !data) return null;
  return { accessToken: data.access_token, refreshToken: data.refresh_token, tokenExpiresAt: data.token_expires_at, platformUserId: data.platform_user_id, platformUsername: data.platform_username, meta: data.meta };
}

export async function upsertToken(userId: string, platform: Platform, data: {
  accessToken: string; refreshToken?: string; expiresInSeconds?: number;
  platformUserId: string; platformUsername?: string; platformAvatar?: string; scope?: string; meta?: Record<string, unknown>;
}): Promise<void> {
  const tokenExpiresAt = data.expiresInSeconds ? new Date(Date.now() + data.expiresInSeconds * 1000).toISOString() : null;
  await supabaseAdmin.from("connected_accounts").upsert({
    user_id: userId, platform, platform_user_id: data.platformUserId,
    platform_username: data.platformUsername ?? null, platform_avatar: data.platformAvatar ?? null,
    access_token: data.accessToken, refresh_token: data.refreshToken ?? null,
    token_expires_at: tokenExpiresAt, scope: data.scope ?? null, meta: data.meta ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id, platform" });
}

export async function deleteToken(userId: string, platform: Platform): Promise<void> {
  await supabaseAdmin.from("connected_accounts").delete().eq("user_id", userId).eq("platform", platform);
}

export function isTokenExpired(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return false;
  return Date.now() >= new Date(tokenExpiresAt).getTime() - 5 * 60 * 1000;
}
