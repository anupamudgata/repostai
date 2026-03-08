import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduledList } from "@/components/dashboard/scheduled-list";

export default async function ScheduledPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: scheduled } = await supabase
    .from("scheduled_posts")
    .select(
      "id, platform, scheduled_at, status, posted_at, error_message, created_at"
    )
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true });

  const pending = scheduled?.filter((s) => s.status === "pending") ?? [];
  const past = scheduled?.filter((s) => s.status !== "pending") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scheduled posts</h1>
        <p className="text-muted-foreground mt-1">
          Upcoming and recent scheduled posts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No upcoming scheduled posts.
            </p>
          ) : (
            <ScheduledList items={pending} />
          )}
        </CardContent>
      </Card>

      {past.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent</CardTitle>
          </CardHeader>
          <CardContent>
            <ScheduledList items={past} showStatus />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
