import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertToken } from "@/lib/social/token-store";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { botToken?: string; chatId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { botToken, chatId } = body;
  if (!botToken || !chatId) {
    return NextResponse.json({ error: "botToken and chatId are required" }, { status: 400 });
  }

  // Validate the bot token by calling getMe
  let botId: string;
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await res.json() as { ok: boolean; result?: { id: number; username?: string }; description?: string };
    if (!data.ok) {
      return NextResponse.json({ error: data.description ?? "Invalid bot token" }, { status: 400 });
    }
    botId = String(data.result!.id);
  } catch {
    return NextResponse.json({ error: "Failed to validate bot token" }, { status: 502 });
  }

  await upsertToken(user.id, "telegram", {
    accessToken: botToken,
    platformUserId: botId,
    platformUsername: chatId,
  });

  return NextResponse.json({ success: true });
}
