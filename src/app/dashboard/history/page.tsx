import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: jobs } = await supabase
    .from("repurpose_jobs")
    .select("*, repurpose_outputs(*)")
    .eq("user_id", user!.id)
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
            <Card key={job.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    {job.input_content?.slice(0, 100)}...
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{job.input_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {job.repurpose_outputs?.map(
                    (output: { id: string; platform: string }) => (
                      <Badge key={output.id} variant="secondary" className="text-xs">
                        {output.platform}
                      </Badge>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
