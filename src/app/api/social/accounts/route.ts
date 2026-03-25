import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const platform = req.nextUrl.searchParams.get("platform");
    if (!platform) return NextResponse.json({ error: "Missing platform parameter" }, { status: 400 });

    const { error } = await supabaseAdmin
      .from("connected_accounts")
      .delete()
      .eq("user_id", user.id)
      .eq("platform", platform);

    if (error) {
      console.error("[social/accounts] DELETE error:", error);
      return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[social/accounts] DELETE error:", err);
    return NextResponse.json({ error: "Failed to disconnect account" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data } = await supabaseAdmin
      .from("connected_accounts")
      .select("platform, platform_username, platform_avatar, token_expires_at")
      .eq("user_id", user.id);
    const accounts = (data ?? []).map((row) => ({
      platform: row.platform,
      platformUsername: row.platform_username,
      platformAvatar: row.platform_avatar,
      tokenExpiresAt: row.token_expires_at,
      status: row.token_expires_at && new Date(row.token_expires_at) < new Date() ? "expired" : "connected",
    }));
    return NextResponse.json({ accounts });
  } catch (err) {
    console.error("[social/accounts] Error:", err);
    return NextResponse.json({ error: "Failed to load accounts" }, { status: 500 });
  }
}
