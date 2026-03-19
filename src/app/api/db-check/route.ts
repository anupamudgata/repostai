import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Health check for DB connectivity. No auth required. */
export async function GET() {
  const checks: Record<string, { ok: boolean; error?: string }> = {};

  // 1. Anon client (server)
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    checks.anon_client = { ok: !error, error: error?.message };
  } catch (e) {
    checks.anon_client = { ok: false, error: String(e) };
  }

  // 2. Service role / admin
  try {
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    checks.service_role = { ok: !error, error: error?.message };
  } catch (e) {
    checks.service_role = { ok: false, error: String(e) };
  }

  // 3. Env vars present (no values)
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  checks.env = {
    ok: hasUrl && hasAnon && hasService,
    error: !hasUrl ? "NEXT_PUBLIC_SUPABASE_URL missing" : !hasAnon ? "NEXT_PUBLIC_SUPABASE_ANON_KEY missing" : !hasService ? "SUPABASE_SERVICE_ROLE_KEY missing" : undefined,
  };

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 503 }
  );
}
