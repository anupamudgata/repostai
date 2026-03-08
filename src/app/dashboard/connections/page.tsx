"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Link2, Loader2, Unplug } from "lucide-react";

type ConnectedAccount = {
  id: string;
  provider: string;
  username: string | null;
  created_at: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  config: "Twitter/Connections are not configured. Contact support.",
  invalid_callback: "Invalid callback. Please try connecting again.",
  token: "Could not get access. Try again or contact support.",
  save: "Connected but failed to save. Please try again.",
};
const INFO_MESSAGES: Record<string, string> = {
  linkedin_coming_soon: "LinkedIn connection is coming soon.",
};

export default function ConnectionsPage() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const error = searchParams.get("error");
    const info = searchParams.get("info");
    if (error && ERROR_MESSAGES[error]) {
      toast.error(ERROR_MESSAGES[error]);
    }
    if (info && INFO_MESSAGES[info]) {
      toast.info(INFO_MESSAGES[info]);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("connected_accounts")
      .select("id, provider, username, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error("Could not load connections");
          setAccounts([]);
        } else {
          setAccounts(data ?? []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleDisconnect(id: string) {
    setDisconnectingId(id);
    const { error } = await supabase
      .from("connected_accounts")
      .delete()
      .eq("id", id);
    setDisconnectingId(null);
    if (error) {
      toast.error("Could not disconnect");
      return;
    }
    toast.success("Account disconnected");
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  const providerLabel: Record<string, string> = {
    twitter: "Twitter / X",
    linkedin: "LinkedIn",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Connected accounts</h1>
        <p className="text-muted-foreground mt-1">
          Connect social accounts to post or schedule repurposed content directly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your connections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {accounts.length === 0 ? (
                <p className="text-muted-foreground">
                  No accounts connected yet. Connect one below to post or schedule from RepostAI.
                </p>
              ) : (
                <ul className="space-y-3">
                  {accounts.map((acc) => (
                    <li
                      key={acc.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <span className="font-medium">
                          {providerLabel[acc.provider] ?? acc.provider}
                        </span>
                        {acc.username && (
                          <span className="text-muted-foreground ml-2">
                            @{acc.username}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(acc.id)}
                        disabled={disconnectingId === acc.id}
                      >
                        {disconnectingId === acc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Unplug className="h-4 w-4 mr-1" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-4 border-t flex flex-wrap gap-3">
                <Button asChild>
                  <a href="/api/connect/twitter">
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect Twitter / X
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/api/connect/linkedin">
                    <Link2 className="h-4 w-4 mr-2" />
                    Connect LinkedIn
                  </a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
