"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { SUPPORTED_PLATFORMS } from "@/config/constants";

type Item = {
  id: string;
  platform: string;
  scheduled_at: string;
  status: string;
  posted_at: string | null;
  error_message: string | null;
  created_at: string;
};

export function ScheduledList({
  items,
  showStatus = false,
}: {
  items: Item[];
  showStatus?: boolean;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase
      .from("scheduled_posts")
      .delete()
      .eq("id", id);
    setDeletingId(null);
    if (error) {
      toast.error("Could not delete");
      return;
    }
    toast.success("Scheduled post removed");
    window.location.reload();
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const platformName =
          SUPPORTED_PLATFORMS.find((p) => p.id === item.platform)?.name ??
          item.platform;
        return (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div>
              <span className="font-medium">{platformName}</span>
              <span className="text-muted-foreground text-sm ml-2">
                {new Date(item.scheduled_at).toLocaleString()}
              </span>
              {showStatus && (
                <span className="ml-2">
                  <Badge
                    variant={
                      item.status === "completed"
                        ? "default"
                        : item.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>
                  {item.error_message && (
                    <span className="text-xs text-muted-foreground ml-1">
                      {item.error_message}
                    </span>
                  )}
                </span>
              )}
            </div>
            {item.status === "pending" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
              >
                {deletingId === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </>
                )}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
