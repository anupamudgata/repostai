import { getResend, FROM_EMAIL }    from "@/lib/email/resend";
import { welcomeEmailHtml }         from "@/lib/email/templates/welcome";
import { proUpgradeEmailHtml }      from "@/lib/email/templates/pro-upgrade";

export async function sendWelcomeEmail(params: { email: string; firstName: string }) {
  const { email, firstName } = params;
  const { data, error } = await getResend().emails.send({
    from:    `Anupam from RepostAI <${FROM_EMAIL}>`,
    to:      [email],
    subject: `Welcome to RepostAI, ${firstName}! Here's how to start`,
    html:    welcomeEmailHtml(firstName),
    text:    `Hi ${firstName},\n\nWelcome to RepostAI! Your free account is ready.\n\nDo your first repurpose: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\n— Anupam, Founder of RepostAI\nReply to this email anytime.`.trim(),
  });
  if (error) console.error("[email] Failed to send welcome email:", error);
  else console.log(`[email] ✓ Welcome email sent to ${email}`, data?.id);
}

export async function sendUpgradeEmail(params: { email: string; firstName: string; plan: "starter" | "pro" | "agency" }) {
  const { email, firstName, plan } = params;
  const planName = plan === "starter" ? "Starter" : plan === "pro" ? "Pro" : "Agency";
  const { data, error } = await getResend().emails.send({
    from:    `Anupam from RepostAI <${FROM_EMAIL}>`,
    to:      [email],
    subject: `You're on RepostAI ${planName} — here's what just unlocked`,
    html:    proUpgradeEmailHtml(firstName, plan),
    text:    `Hi ${firstName},\n\nYou are now on RepostAI ${planName}! Your features are live.\n\nGo repurpose something: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard\n\nQuestions? Reply to this email.\n\n— Anupam`.trim(),
  });
  if (error) console.error("[email] Failed to send upgrade email:", error);
  else console.log(`[email] ✓ Upgrade email sent to ${email} (${plan})`, data?.id);
}
