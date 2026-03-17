import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const jobIds = body.jobIds as string[] | undefined;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: "jobIds array required" },
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

    const { error } = await supabase
      .from("repurpose_jobs")
      .delete()
      .eq("user_id", user.id)
      .in("id", jobIds);

    if (error) {
      console.error("History bulk delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete history items" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, deleted: jobIds.length });
  } catch (error) {
    console.error("History bulk delete error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
