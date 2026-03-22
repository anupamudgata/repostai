import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: row, error } = await supabase
      .from("photo_uploads")
      .select(
        "id, public_url, thumbnail_url, status, vision_analysis, user_context, error_message, created_at"
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ photo: row });
  } catch (e) {
    console.error("[photos/[id]]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
