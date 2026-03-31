import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { sendWelcomeEmail } from "@/lib/email/send";
import { ensureProfileForRepurposeInsert } from "@/lib/supabase/ensure-profile";

function getBaseUrl(request: NextRequest): string {
  const allowed = process.env.NEXT_PUBLIC_APP_URL;
  if (allowed) return allowed.replace(/\/+$/, "");
  return request.nextUrl.origin;
}

function isSafeRedirect(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes(":");
}

/** Supabase email / OAuth callbacks must set session cookies on the outgoing Response. Using `cookies()` from `next/headers` in a Route Handler often does not attach `Set-Cookie` to a `NextResponse.redirect`, so users land logged out. */
function createRouteHandlerClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}

const VERIFY_OTP_TYPES = new Set<string>([
  "signup",
  "email",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
]);

function parseOtpType(raw: string | null): EmailOtpType | null {
  if (!raw || !VERIFY_OTP_TYPES.has(raw)) return null;
  return raw as EmailOtpType;
}

function redirectToLogin(
  baseUrl: string,
  query: Record<string, string>
): NextResponse {
  const u = new URL("/login", baseUrl);
  for (const [k, v] of Object.entries(query)) {
    if (v) u.searchParams.set(k, v);
  }
  const res = NextResponse.redirect(u);
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

async function afterSession(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  response: NextResponse
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    // Check before profile ensure so we know if this is first sign-in
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    const isNewUser = !existingProfile;

    try {
      await ensureProfileForRepurposeInsert(user, supabase);
    } catch (ensureErr) {
      console.error("[auth callback] ensureProfileForRepurposeInsert failed:", ensureErr);
    }

    // Only send welcome email on the very first sign-in
    if (isNewUser && user.email) {
      try {
        const fullName = (user.user_metadata?.full_name as string) ?? "";
        const firstName = fullName.split(" ")[0] || user.email.split("@")[0];
        await sendWelcomeEmail({ email: user.email, firstName });
      } catch (emailErr) {
        console.error("[auth callback] Welcome email failed:", emailErr);
      }
    }
  }
  response.headers.set("Cache-Control", "private, no-store");
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const searchParams = requestUrl.searchParams;
  const baseUrl = getBaseUrl(request);
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = isSafeRedirect(rawNext) ? rawNext : "/dashboard";
  const destination = new URL(next, baseUrl);

  const oauthError = searchParams.get("error");
  if (oauthError) {
    const detail =
      searchParams.get("error_description")?.replace(/\+/g, " ") ?? oauthError;
    return redirectToLogin(baseUrl, {
      error: "oauth",
      detail: detail.slice(0, 500),
    });
  }

  const code = searchParams.get("code");
  if (code) {
    const response = NextResponse.redirect(destination);
    const supabase = createRouteHandlerClient(request, response);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth callback] exchangeCodeForSession:", error.message);
      return redirectToLogin(baseUrl, {
        error: "auth",
        reason: "exchange_failed",
      });
    }
    await afterSession(supabase, response);
    return response;
  }

  const token_hash = searchParams.get("token_hash");
  const typeRaw = searchParams.get("type");
  const otpType = parseOtpType(typeRaw);
  if (token_hash && otpType) {
    const response = NextResponse.redirect(destination);
    const supabase = createRouteHandlerClient(request, response);
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash,
    });
    if (error) {
      console.error("[auth callback] verifyOtp:", error.message);
      return redirectToLogin(baseUrl, {
        error: "auth",
        reason: "verify_failed",
      });
    }
    await afterSession(supabase, response);
    return response;
  }

  return redirectToLogin(baseUrl, { error: "auth", reason: "missing_code" });
}
