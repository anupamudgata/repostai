import { createOpenAI } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { REPOSTAI_SUPPORT_SYSTEM_PROMPT } from "@/lib/support-chat/system-prompt";
import { buildSupportChatTools } from "@/lib/support-chat/tools";
import { textFromUIMessageParts } from "@/lib/support-chat/db-message";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  messages: z.array(z.unknown()),
  id: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  trigger: z.string().optional(),
  messageId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const sessionId = parsed.data.sessionId ?? parsed.data.id;
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "sessionId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Chat is not configured" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id, user_id, status")
      .eq("id", sessionId)
      .maybeSingle();

    if (sessionError || !session || session.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    const userEmail = profile?.email ?? user.email ?? "";

    const uiMessages = parsed.data.messages as UIMessage[];
    const tools = buildSupportChatTools({
      supabase,
      sessionId,
      userId: user.id,
      userEmail,
    });

    let modelMessages;
    try {
      modelMessages = await convertToModelMessages(uiMessages, {
        tools,
        ignoreIncompleteToolCalls: true,
      });
    } catch (convErr) {
      console.error("[support-chat] convertToModelMessages:", convErr);
      return new Response(
        JSON.stringify({
          error: "Invalid message history. Try refreshing the chat or starting a new message.",
          code: "INVALID_MESSAGES",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const last = uiMessages[uiMessages.length - 1];
    if (last?.role === "user") {
      const content = textFromUIMessageParts(last.parts);
      const { error: upsertUserErr } = await supabase.from("chat_messages").upsert(
        {
          id: last.id,
          session_id: sessionId,
          role: "user",
          content,
          parts: last.parts as unknown as Record<string, unknown>[],
        },
        { onConflict: "id" }
      );
      if (upsertUserErr) {
        console.error("[support-chat] user message upsert:", upsertUserErr);
      }
    }

    await supabase
      .from("chat_sessions")
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    const openai = createOpenAI({ apiKey });
    const modelId = process.env.SUPPORT_CHAT_MODEL ?? "gpt-4o-mini";

    const system =
      session.status === "needs_human"
        ? `${REPOSTAI_SUPPORT_SYSTEM_PROMPT}

This chat is already escalated to humans. Keep replies short. Remind them the team will follow up by email if relevant. Only call escalateToHuman again if they clearly request another escalation.`
        : REPOSTAI_SUPPORT_SYSTEM_PROMPT;

    const result = streamText({
      model: openai(modelId),
      system,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(12),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: uiMessages,
      onFinish: async ({ responseMessage }) => {
        const content = textFromUIMessageParts(responseMessage.parts);
        const { error: asstErr } = await supabase.from("chat_messages").upsert(
          {
            id: responseMessage.id,
            session_id: sessionId,
            role: "assistant",
            content,
            parts: responseMessage.parts as unknown as Record<string, unknown>[],
          },
          { onConflict: "id" }
        );
        if (asstErr) {
          console.error("[support-chat] assistant message upsert:", asstErr);
        }
        await supabase
          .from("chat_sessions")
          .update({
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId);
      },
    });
  } catch (e) {
    console.error("[support-chat] POST /api/chat:", e);
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
