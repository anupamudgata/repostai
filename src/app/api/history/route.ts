import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const NO_STORE = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
} as const;

function jsonWithNoStore(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status,
    headers: NO_STORE,
  });
}

/** GET /api/history — flat list of repurpose outputs for history page */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return jsonWithNoStore({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: jobs, error: jobsError } = await supabase
      .from("repurpose_jobs")
      .select("id, input_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    if (jobsError || !jobs?.length) {
      return jsonWithNoStore({ items: [] });
    }

    const jobIds = jobs.map((j) => j.id);
    const { data: outputs, error: outputsError } = await supabase
      .from("repurpose_outputs")
      .select("id, job_id, platform, generated_content, edited_content, created_at")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false });

    if (outputsError) {
      console.error("History outputs fetch error:", outputsError);
      return jsonWithNoStore({ error: "Failed to load history" }, { status: 500 });
    }

    const jobMap = new Map(jobs.map((j) => [j.id, j]));
    const items = (outputs ?? []).map((o) => {
      const job = jobMap.get(o.job_id);
      return {
        id: o.id,
        job_id: o.job_id,
        platform: o.platform,
        content: o.edited_content ?? o.generated_content ?? "",
        input_type: job?.input_type ?? "text",
        created_at: o.created_at,
      };
    });

    return jsonWithNoStore({ items });
  } catch (error) {
    console.error("History fetch error:", error);
    return jsonWithNoStore({ error: "Failed to load history" }, { status: 500 });
  }
}
