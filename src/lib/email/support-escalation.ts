import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { APP_URL } from "@/config/constants";

const INBOX = process.env.SUPPORT_ESCALATION_INBOX;

/**
 * Notifies the team when a user escalates from the in-app support widget.
 * No-ops if RESEND_API_KEY or SUPPORT_ESCALATION_INBOX is missing.
 */
export async function sendSupportEscalationEmail(params: {
  userEmail: string;
  sessionId: string;
  messageCount: number;
}) {
  const to = INBOX?.trim();
  if (!to || !process.env.RESEND_API_KEY) return;

  const { userEmail, sessionId, messageCount } = params;
  const dashboardUrl = `${APP_URL}/dashboard`;

  try {
    const { error } = await getResend().emails.send({
      from: `RepostAI Support Bot <${FROM_EMAIL}>`,
      to: [to],
      replyTo: userEmail,
      subject: `[RepostAI] Support escalation — ${userEmail}`,
      text: [
        `User: ${userEmail}`,
        `Chat session: ${sessionId}`,
        `Messages in session (approx): ${messageCount}`,
        `Open dashboard: ${dashboardUrl}`,
      ].join("\n"),
    });
    if (error) console.error("[support-chat] escalation email failed:", error);
  } catch (e) {
    console.error("[support-chat] escalation email exception:", e);
  }
}
