import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";

/**
 * Returns effective billing plan + AI routing hints.
 * Pro/Agency → aiTier "premium" (Claude when ANTHROPIC_API_KEY is set; else GPT‑4o‑mini fallback).
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        plan: "free",
        aiTier: "standard",
      });
    }

    const { plan } = await getEffectivePlan(supabase, user.id, user.email);
    const entitlements = getEntitlements(plan);
    const claudeConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    const usesClaudeForPremium =
      entitlements.aiTier === "premium" && claudeConfigured;

    return NextResponse.json({
      plan,
      aiTier: entitlements.aiTier,
      claudeConfigured,
      /** True when this request would use Claude for repurpose / photo captions (barring runtime API errors). */
      premiumUsesClaude: usesClaudeForPremium,
    });
  } catch {
    return NextResponse.json({
      plan: "free",
      aiTier: "standard",
    });
  }
}
