// src/app/api/social/accounts/route.ts
import { NextResponse }  from "next/server";
import { createClient }  from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data } = await supabaseAdmin
    .from("connected_accounts")
    .select("platform, platform_username, platform_avatar, token_expires_at")
    .eq("user_id", user.id);
  const accounts = (data ?? []).map((row) => ({
    platform:         row.platform,
    platformUsername: row.platform_username,
    platformAvatar:   row.platform_avatar,
    tokenExpiresAt:   row.token_expires_at,
    status:           row.token_expires_at && new Date(row.token_expires_at) < new Date() ? "expired" : "connected",
  }));
  return NextResponse.json({ accounts });
}
