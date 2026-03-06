import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { HistoryCard } from "@/components/dashboard/history-card";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: jobs } = await supabase
    .from("repurpose_jobs")
    .select("*, repurpose_outputs(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mt-1">
          Your recent repurposed content.
        </p>
      </div>

      {!jobs || jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No history yet</h3>
            <p className="text-muted-foreground">
              Your repurposed content will appear here after your first use.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <HistoryCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
