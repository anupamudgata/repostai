import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, List } from "lucide-react";
import { ScheduledList } from "@/components/dashboard/scheduled-list";
import { ScheduledCalendarWrapper } from "@/components/dashboard/scheduled-calendar-wrapper";
import type { ScheduledPostData } from "@/components/dashboard/content-calendar";

export default async function ScheduledPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Repurpose scheduled posts
  const { data: scheduled } = await supabase
    .from("scheduled_posts")
    .select(
      `id, platform, scheduled_at, status, posted_at, error_message, created_at,
       repurpose_outputs ( generated_content, edited_content )`
    )
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true });

  // Photo caption posts (posted + scheduled)
  const { data: photoPosts } = await supabase
    .from("photo_caption_runs")
    .select("id, platforms, captions, status, scheduled_for, posted_at, created_at, error")
    .eq("user_id", user.id)
    .in("status", ["posted", "scheduled", "failed"])
    .order("created_at", { ascending: true });

  // Normalise photo posts into the same shape as ScheduledPostData
  const photoNormalised: ScheduledPostData[] = (photoPosts ?? []).flatMap((run) => {
    const platforms: string[] = run.platforms ?? [];
    const captions: Record<string, string> = (run.captions as Record<string, string>) ?? {};
    return platforms.map((platform) => ({
      id: `${run.id}__${platform}`,
      platform,
      scheduled_at: run.scheduled_for ?? run.posted_at ?? run.created_at,
      status: run.status === "posted" ? "posted" : run.status === "failed" ? "failed" : "pending",
      posted_at: run.posted_at ?? null,
      error_message: run.error ?? null,
      created_at: run.created_at,
      repurpose_outputs: {
        generated_content: captions[platform] ?? null,
        edited_content: null,
      },
    }));
  });

  const allPosts = [
    ...((scheduled ?? []) as unknown as ScheduledPostData[]),
    ...photoNormalised,
  ].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const pending = allPosts.filter((s) => s.status === "pending");
  const past = allPosts.filter((s) => s.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Content Calendar</h1>
        <p className="text-muted-foreground mt-1">
          See your month at a glance, drag to reschedule, and spot content gaps.
        </p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full max-w-[280px] grid-cols-2">
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <ScheduledCalendarWrapper posts={allPosts} />
        </TabsContent>

        <TabsContent value="list" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              {pending.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No upcoming scheduled posts. Schedule from the Repurpose page after creating content.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
