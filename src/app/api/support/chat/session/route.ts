import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dbRowToUIMessage } from "@/lib/support-chat/db-message";
import type { UIMessage } from "ai";

export const dynamic = "force-dynamic";

/**
 * Returns the user's active support session (or creates one) and message history for the widget.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["open", "needs_human"])
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sessionId = existing?.id;
  let status = existing?.status ?? "open";

  if (!sessionId) {
    const { data: created, error: createError } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id })
      .select("id, status")
      .single();

    if (createError || !created) {
      console.error("[support-chat] session create:", createError);
      return NextResponse.json({ error: "Could not start chat session" }, { status: 500 });
    }
    sessionId = created.id;
    status = created.status;
  }

  const { data: rows, error: msgError } = await supabase
    .from("chat_messages")
    .select("id, role, content, parts")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (msgError) {
    console.error("[support-chat] messages load:", msgError);
    return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
  }

  const messages = (rows ?? [])
    .map(dbRowToUIMessage)
    .filter((m): m is UIMessage => m != null);

  return NextResponse.json({ sessionId, status, messages });
}
