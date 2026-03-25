import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks: Record<string, { ok: boolean; error?: string }> = {};

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").select("id").limit(1);
    checks.anon_client = { ok: !error, error: error?.message };
  } catch (e) {
    checks.anon_client = { ok: false, error: String(e) };
  }

  try {
    const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
    checks.service_role = { ok: !error, error: error?.message };
  } catch (e) {
    checks.service_role = { ok: false, error: String(e) };
  }

  const allOk = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 503 }
  );
}
