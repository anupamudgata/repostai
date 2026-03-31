import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Public lifetime stats for marketing (no auth). Counts every repurpose job ever created.
 * Cached briefly to limit database load.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("repurpose_jobs")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("[stats/public] count error", error.message);
      return NextResponse.json(
        { totalRepurposes: 0 },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
          },
        }
      );
    }

    const totalRepurposes = count ?? 0;

    return NextResponse.json(
      { totalRepurposes },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  } catch (e) {
    console.error("[stats/public]", e);
    return NextResponse.json(
      { totalRepurposes: 0 },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60",
        },
      }
    );
  }
}
