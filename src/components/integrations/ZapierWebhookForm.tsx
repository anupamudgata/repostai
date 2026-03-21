"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import { useAppToast } from "@/hooks/use-app-toast";

export function ZapierWebhookForm() {
  const toastT = useAppToast();
  const [url, setUrl] = useState("");
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((data) => {
        if (data && typeof data.zapier_webhook_url === "string") {
          setSavedUrl(data.zapier_webhook_url);
          setUrl(data.zapier_webhook_url || "");
          setIsLoggedIn(true);
        } else if (data) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    const trimmed = url.trim();
    if (trimmed && (!trimmed.startsWith("https://") || trimmed.length > 500)) {
      toastT.error("toast.invalidWebhookUrl");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zapier_webhook_url: trimmed || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastT.errorFromApi(
          { error: data.error, code: data.code },
          "toast.couldNotSave"
        );
        return;
      }
      setSavedUrl(trimmed || null);
      toastT.success(
        trimmed ? "toast.webhookSaved" : "toast.webhookCleared"
      );
    } catch {
      toastT.error("toast.genericError");
    } finally {
      setSaving(false);
    }
  }

  if (!loading && !isLoggedIn) return null;

  return (
    <Card className="mb-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Your Zapier webhook URL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Create a Zap with trigger <strong>Webhooks by Zapier</strong> → <strong>Catch Hook</strong>.
          Copy the webhook URL Zapier gives you and paste it below. Every time you finish a repurpose,
          we&apos;ll send the results to that URL so your Zap can post to LinkedIn, Twitter, Notion, etc.
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <Label htmlFor="zapier-url" className="sr-only">
                Webhook URL
              </Label>
              <Input
                id="zapier-url"
                type="url"
                placeholder="https://hooks.zapier.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 font-mono text-sm"
              />
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
            {savedUrl && (
              <p className="text-xs text-muted-foreground">
                Active. Repurpose outputs are sent to your Zap.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
