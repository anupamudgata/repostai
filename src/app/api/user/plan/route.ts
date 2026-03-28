import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getEffectivePlan,
  getEntitlements,
} from "@/lib/billing/plan-entitlements";

/**
 * Returns effective billing plan + AI routing hints.
 * - Free/Starter → aiTier "standard"  (GPT-4o-mini)
 * - Pro          → aiTier "enhanced"  (Claude Haiku 4.5 when ANTHROPIC_API_KEY set)
 * - Agency       → aiTier "premium"   (Claude Sonnet 4 when ANTHROPIC_API_KEY set)
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
    const usesClaude =
      (entitlements.aiTier === "premium" || entitlements.aiTier === "enhanced") && claudeConfigured;

    return NextResponse.json({
      plan,
      aiTier: entitlements.aiTier,
      claudeConfigured,
      /** True when this request would use Claude for repurpose / photo captions (barring runtime API errors). */
      premiumUsesClaude: usesClaude,
    });
  } catch {
    return NextResponse.json({
      plan: "free",
      aiTier: "standard",
    });
  }
}
