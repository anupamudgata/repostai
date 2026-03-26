import { tool } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendSupportEscalationEmail } from "@/lib/email/support-escalation";

const ESCALATION_USER_MESSAGE =
  "I've escalated this to our human team. They will email you shortly.";

export function buildSupportChatTools(ctx: {
  supabase: SupabaseClient;
  sessionId: string;
  userId: string;
  userEmail: string;
}) {
  return {
    escalateToHuman: tool({
      description:
        "Escalate to RepostAI's human support team. Use when the user asks for a human, says support/operator, or you cannot resolve their issue. Creates an internal ticket and marks the chat for human follow-up by email.",
      inputSchema: z.object({
        reason: z
          .string()
          .optional()
          .describe("Short reason, e.g. user_requested_human, billing_dispute, technical_unresolved"),
        urgency: z
          .enum(["low", "medium", "high"])
          .optional()
          .describe("How urgent this feels: billing/security → high; general help → medium; FYI → low"),
      }),
      execute: async ({ reason, urgency }) => {
        const { supabase, sessionId, userId, userEmail } = ctx;

        const { data: rows } = await supabase
          .from("chat_messages")
          .select("role, content, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true });

        const transcript_snapshot = rows ?? [];
        const transcript = JSON.stringify(transcript_snapshot);
        const urgencyLevel = urgency ?? "medium";

        const { data: ticketRow, error: ticketError } = await supabase
          .from("support_tickets")
          .insert({
            user_id: userId,
            session_id: sessionId,
            reason: reason ?? "ai_escalation",
            transcript_snapshot,
            transcript,
            urgency: urgencyLevel,
            user_email: userEmail,
            status: "needs_human",
          })
          .select("id")
          .single();

        if (ticketError) {
          console.error("[support-chat] support_tickets insert:", ticketError);
        }

        const { error: sessionError } = await supabase
          .from("chat_sessions")
          .update({
            status: "needs_human",
            updated_at: new Date().toISOString(),
          })
          .eq("id", sessionId)
          .eq("user_id", userId);

        if (sessionError) {
          console.error("[support-chat] chat_sessions update:", sessionError);
        }

        await sendSupportEscalationEmail({
          userEmail,
          sessionId,
          messageCount: transcript_snapshot.length,
        });

        if (ticketRow?.id) {
          const notifiedAt = new Date().toISOString();
          await supabase
            .from("support_tickets")
            .update({ notified_at: notifiedAt, updated_at: notifiedAt })
            .eq("id", ticketRow.id);
        }

        return {
          ok: true as const,
          userFacingMessage: ESCALATION_USER_MESSAGE,
        };
      },
    }),
  };
}
