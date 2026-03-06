"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, ChevronDown, ChevronUp, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
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

export function HistoryCard({ job }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [outputs, setOutputs] = useState(job.repurpose_outputs || []);
  const [regeneratingPlatform, setRegeneratingPlatform] = useState<string | null>(null);

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
              return (
                <div
                  key={output.id}
                  className="rounded-lg bg-muted/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{platformName}</span>
                    <div className="flex gap-1">
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
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
