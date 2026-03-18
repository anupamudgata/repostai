import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: job } = await supabase
      .from("repurpose_jobs")
      .select("id")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { data: outputs } = await supabase
      .from("repurpose_outputs")
      .select("id, platform, generated_content")
      .eq("job_id", jobId)
      .order("platform");

    return NextResponse.json({ outputs: outputs ?? [] });
  } catch (error) {
    console.error("History outputs fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
