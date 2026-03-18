import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const scheduledAt = body.scheduledAt as string | undefined;

    if (!scheduledAt) {
      return NextResponse.json(
        { error: "Missing scheduledAt (ISO date-time)" },
        { status: 400 }
      );
    }

    const at = new Date(scheduledAt);
    if (Number.isNaN(at.getTime()) || at.getTime() <= Date.now()) {
      return NextResponse.json(
        { error: "scheduledAt must be a future date/time" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("scheduled_posts")
      .update({ scheduled_at: at.toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to reschedule or post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reschedule API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("scheduled_posts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete scheduled API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
