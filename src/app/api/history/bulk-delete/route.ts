import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jobIds = body.jobIds as string[] | undefined;
    const outputIds = body.outputIds as string[] | undefined;

    const hasJobs = Array.isArray(jobIds) && jobIds.length > 0;
    const hasOutputs = Array.isArray(outputIds) && outputIds.length > 0;

    if (!hasJobs && !hasOutputs) {
      return NextResponse.json(
        { error: "jobIds or outputIds array required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (hasOutputs) {
      const { data: deletedRows, error } = await supabase
        .from("repurpose_outputs")
        .delete()
        .in("id", outputIds!)
        .select("id");

      if (error) {
        console.error("History bulk delete (outputs) error:", error);
        return NextResponse.json(
          { error: "Failed to delete history items" },
          { status: 500 }
        );
      }

      const deleted = deletedRows?.length ?? 0;
      return NextResponse.json({
        success: true,
        deleted,
        requested: outputIds!.length,
      });
    }

    const { data: deletedJobs, error } = await supabase
      .from("repurpose_jobs")
      .delete()
      .eq("user_id", user.id)
      .in("id", jobIds!)
      .select("id");

    if (error) {
      console.error("History bulk delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete history items" },
        { status: 500 }
      );
    }

    const deleted = deletedJobs?.length ?? 0;
    return NextResponse.json({
      success: true,
      deleted,
      requested: jobIds!.length,
    });
  } catch (error) {
    console.error("History bulk delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
