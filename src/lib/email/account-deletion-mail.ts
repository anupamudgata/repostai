import {
  accountDeletionCompleteEmailHtml,
  accountDeletionLinkEmailHtml,
} from "@/lib/email/templates/account-deletion";

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "support@repostai.com";

function baseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendAccountDeletionLinkEmail(params: {
  to: string;
  token: string;
}): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[account-deletion] RESEND_API_KEY missing; skipping link email");
    return { sent: false, error: "Email not configured" };
  }
  const confirmUrl = `${baseUrl().replace(/\/$/, "")}/dashboard/settings/delete/confirm?token=${encodeURIComponent(params.token)}`;
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: `RepostAI <${FROM}>`,
    to: [params.to],
    subject: "Confirm deletion of your RepostAI account",
    html: accountDeletionLinkEmailHtml({ confirmUrl, expiresInHours: 48 }),
    text: `Confirm account deletion (link expires in ~48 hours):\n\n${confirmUrl}\n\nIf you did not request this, ignore this email.`,
  });
  if (error) {
    console.error("[account-deletion] Link email failed:", error);
    return { sent: false, error: String(error) };
  }
  return { sent: true };
}

export async function sendAccountDeletionCompleteEmail(params: {
  to: string;
}): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[account-deletion] RESEND_API_KEY missing; skipping completion email");
    return { sent: false, error: "Email not configured" };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from: `RepostAI <${FROM}>`,
    to: [params.to],
    subject: "Your RepostAI account has been deleted",
    html: accountDeletionCompleteEmailHtml(),
    text: `Your RepostAI account and associated personal data have been removed from our systems as you requested.\n\n${baseUrl()}`,
  });
  if (error) {
    console.error("[account-deletion] Complete email failed:", error);
    return { sent: false, error: String(error) };
  }
  return { sent: true };
}
