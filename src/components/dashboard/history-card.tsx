"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Copy, Check, ChevronDown, ChevronUp, RefreshCw, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_PLATFORMS } from "@/config/constants";

interface RepurposeOutput {
  id: string;
  platform: string;
  generated_content: string;
}

interface HistoryCardProps {
  job: {
    id: string;
    input_content: string | null;
    input_type: string;
    created_at: string;
    repurpose_outputs: RepurposeOutput[];
  };
}

function platformProvider(p: string): string | null {
  if (p === "twitter_thread" || p === "twitter_single") return "twitter";
  if (p === "linkedin") return "linkedin";
  return null;
}

export function HistoryCard({ job }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outputs, setOutputs] = useState(job.repurpose_outputs || []);
  const [regeneratingPlatform, setRegeneratingPlatform] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<{ id: string; provider: string }[]>([]);
  const [postingPlatform, setPostingPlatform] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .from("connected_accounts")
      .select("id, provider")
      .then(({ data }) => setConnectedAccounts(data ?? []));
  }, []);

  async function handleCopy(content: string, outputId: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(outputId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleRegenerate(platform: string) {
    setRegeneratingPlatform(platform);
    try {
      const res = await fetch("/api/repurpose/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, platform }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Regeneration failed");
        return;
      }
      setOutputs((prev) =>
        prev.map((o) =>
          o.platform === platform ? { ...o, generated_content: data.content } : o
        )
      );
      toast.success("Regenerated!");
    } catch {
      toast.error("Network error");
    } finally {
      setRegeneratingPlatform(null);
    }
  }

  async function handlePostNow(platform: string, connectedAccountId: string) {
    setPostingPlatform(platform);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          platform,
          connectedAccountId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Post failed");
        return;
      }
      toast.success("Posted!");
    } catch {
      toast.error("Network error");
    } finally {
      setPostingPlatform(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-base font-medium line-clamp-2">
            {job.input_content?.slice(0, 100)}
            {(job.input_content?.length ?? 0) > 100 && "..."}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline">{job.input_type}</Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {outputs.map((o) => (
            <Badge key={o.id} variant="secondary" className="text-xs">
              {SUPPORTED_PLATFORMS.find((p) => p.id === o.platform)?.name ?? o.platform}
            </Badge>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Hide outputs
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              View & copy outputs
            </>
          )}
        </Button>
        {expanded && (
          <div className="space-y-3 pt-2 border-t">
            {outputs.map((output) => {
              const platformName =
                SUPPORTED_PLATFORMS.find((p) => p.id === output.platform)?.name ??
                output.platform;
              const provider = platformProvider(output.platform);
              const account = provider
                ? connectedAccounts.find((a) => a.provider === provider)
                : null;
              return (
                <div
                  key={output.id}
                  className="rounded-lg bg-muted/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{platformName}</span>
                    <div className="flex gap-1 flex-wrap items-center">
                      {provider && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8"
                            onClick={() =>
                              account
                                ? handlePostNow(output.platform, account.id)
                                : undefined
                            }
                            disabled={postingPlatform !== null || !account}
                            title={!account ? `Connect ${provider === "twitter" ? "Twitter" : "LinkedIn"} to post` : undefined}
                          >
                            {postingPlatform === output.platform ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Post now
                              </>
                            )}
                          </Button>
                          {!account && (
                            <Link
                              href="/dashboard/connections"
                              className="text-xs text-primary hover:underline font-medium"
                            >
                              Connect {provider === "twitter" ? "Twitter" : "LinkedIn"}
                            </Link>
                          )}
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => handleRegenerate(output.platform)}
                        disabled={regeneratingPlatform !== null}
                      >
                        {regeneratingPlatform === output.platform ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Regenerate
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() =>
                          handleCopy(output.generated_content, output.id)
                        }
                      >
                        {copiedId === output.id ? (
                          <>
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {output.generated_content}
                  </div>
                  {(() => {
                    const platformInfo = SUPPORTED_PLATFORMS.find((p) => p.id === output.platform);
                    const maxLength = platformInfo?.maxLength ?? null;
                    const len = output.generated_content.length;
                    const isThread = output.platform === "twitter_thread";
                    const tweetLines = isThread
                      ? output.generated_content.split(/\n/).filter((l) => l.trim().length > 0)
                      : [];
                    const overLimit =
                      maxLength != null &&
                      (isThread
                        ? tweetLines.some((l) => l.length > maxLength)
                        : len > maxLength);
                    const overTweets =
                      isThread && tweetLines.some((l) => l.length > 280)
                        ? tweetLines.filter((l) => l.length > 280).length
                        : 0;
                    return (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                        {isThread ? (
                          <>
                            <span>{len} chars</span>
                            <span>·</span>
                            <span>Each tweet ≤280</span>
                            {overTweets > 0 && (
                              <span className="text-amber-600 dark:text-amber-500 font-medium">
                                {overTweets} over limit
                              </span>
                            )}
                          </>
                        ) : maxLength != null ? (
                          <>
                            <span className={overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""}>
                              {len} / {maxLength}
                            </span>
                            {overLimit && <span className="text-amber-600 dark:text-amber-500 font-medium">Over limit</span>}
                          </>
                        ) : (
                          <span>{len} chars</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
