import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend    = new Resend(process.env.RESEND_API_KEY);
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "support@repostai.com";
export const APP_URL    = process.env.NEXT_PUBLIC_APP_URL ?? "https://repostai.com";
