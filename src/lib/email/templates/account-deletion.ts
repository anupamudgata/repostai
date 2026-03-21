const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://repostai.com";

export function accountDeletionLinkEmailHtml(params: {
  confirmUrl: string;
  expiresInHours: number;
}): string {
  const { confirmUrl, expiresInHours } = params;
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827; max-width: 560px;">
  <h1 style="font-size: 18px;">Confirm account deletion</h1>
  <p style="color: #4B5563; font-size: 14px;">
    Someone requested permanent deletion of a RepostAI account using this email address.
    If this was you, open the link below, type the confirmation phrase, and complete deletion.
  </p>
  <p style="margin: 24px 0;">
    <a href="${confirmUrl}" style="display: inline-block; background: #DC2626; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
      Continue to delete account
    </a>
  </p>
  <p style="color: #6B7280; font-size: 12px;">
    This link expires in about ${expiresInHours} hours. If you did not request this, you can ignore this email — your account will stay active.
  </p>
  <p style="color: #9CA3AF; font-size: 11px; word-break: break-all;">${confirmUrl}</p>
</body>
</html>`.trim();
}

export function accountDeletionCompleteEmailHtml(): string {
  return `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111827; max-width: 560px;">
  <h1 style="font-size: 18px;">Your RepostAI account has been deleted</h1>
  <p style="color: #4B5563; font-size: 14px;">
    We have removed your account and associated personal data from our systems as requested.
    Subscription records tied to your account in our database have been deleted; if you had an active paid plan,
    contact support if you need help with any final billing questions.
  </p>
  <p style="color: #4B5563; font-size: 14px;">
    Thank you for having tried RepostAI.
  </p>
  <p style="color: #9CA3AF; font-size: 12px;">
    <a href="${APP_URL}" style="color: #2563EB;">${APP_URL}</a>
  </p>
</body>
</html>`.trim();
}
