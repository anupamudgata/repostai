import { NextRequest, NextResponse }    from "next/server";
import { createClient }                 from "@/lib/supabase/server";
import { supabaseAdmin }                from "@/lib/supabase/admin";
import { captureError, captureMessage } from "@/lib/sentry";

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (body.confirm !== "DELETE MY ACCOUNT") return NextResponse.json({ error: "Confirmation phrase required." }, { status: 400 });
    const userId = user.id;

    // Delete all data in order (repurpose_outputs deleted via cascade from repurpose_jobs)
    const tables = ["scheduled_posts", "connected_accounts", "repurpose_jobs", "usage", "brand_voices", "subscriptions", "profiles"];
    for (const table of tables) {
      const col = table === "profiles" ? "id" : "user_id";
      const { error } = await supabaseAdmin.from(table).delete().eq(col, userId);
      if (error) {
        captureError(error, { userId, action: "delete_account_table", extra: { table } });
        if (table === "profiles") return NextResponse.json({ error: "Failed to delete account data. Please contact support@repostai.com." }, { status: 500 });
      }
    }

    // Delete auth user last
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      captureError(authDeleteError, { userId, action: "delete_account_auth" });
      return NextResponse.json({ error: "Account data deleted but auth cleanup failed. Please contact support." }, { status: 500 });
    }

    captureMessage("Account deleted successfully", "info", { userId });
    return NextResponse.json({ success: true, message: "Account deleted successfully." }, { status: 200 });
  } catch (err) {
    captureError(err, { action: "delete_account" });
    return NextResponse.json({ error: "Unexpected error. Please contact support@repostai.com." }, { status: 500 });
  }
}
