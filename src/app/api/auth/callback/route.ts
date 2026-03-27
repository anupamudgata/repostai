import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/send";
import { ensureProfileForUser } from "@/lib/supabase/ensure-profile";

function getBaseUrl(request: NextRequest): string {
  const allowed = process.env.NEXT_PUBLIC_APP_URL;
  if (allowed) return allowed.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

function isSafeRedirect(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes(":");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = isSafeRedirect(rawNext) ? rawNext : "/dashboard";
  const baseUrl = getBaseUrl(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await ensureProfileForUser(user);
        } catch (ensureErr) {
          console.error("[auth callback] ensureProfileForUser failed:", ensureErr);
        }
      }
      try {
        if (user?.email) {
          const fullName = (user.user_metadata?.full_name as string) ?? "";
          const firstName = fullName.split(" ")[0] || user.email.split("@")[0];
          await sendWelcomeEmail({ email: user.email, firstName });
        }
      } catch (emailErr) {
        console.error("[auth callback] Welcome email failed:", emailErr);
      }
      return NextResponse.redirect(`${baseUrl}${next}`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth`);
}
