"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Lock,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type {
  ContentTone,
  ContentLength,
  OutputLanguage,
  Platform,
} from "@/types";
import {
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  SUPPORTED_LANGUAGES,
  SUPPORTED_PLATFORMS,
  FREE_PLATFORM_IDS,
  PLANS,
} from "@/config/constants";

const FREE_PLATFORMS_SET = new Set<string>(FREE_PLATFORM_IDS);

type Step = "form" | "preview" | "repurpose";

export default function CreatePage() {
  const [step, setStep] = useState<Step>("form");

  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<ContentTone>("professional");
  const [length, setLength] = useState<ContentLength>("medium");
  const [audience, setAudience] = useState("");
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>("en");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [generatedContent, setGeneratedContent] = useState("");
  const [editedContent, setEditedContent] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [postId, setPostId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "linkedin",
    "twitter_thread",
    "twitter_single",
    "email",
  ]);
  const [repurposeOutputs, setRepurposeOutputs] = useState<
    { platform: Platform; content: string }[]
  >([]);
  const [repurposing, setRepurposing] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const [planError, setPlanError] = useState(false);
  const [userPlan, setUserPlan] = useState("free");

  const isFreePlan = userPlan === "free";

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => { if (d.plan) setUserPlan(d.plan); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isFreePlan) {
      setSelectedPlatforms((prev) =>
        prev.filter((p) => FREE_PLATFORMS_SET.has(p))
      );
    }
  }, [isFreePlan]);

  async function handleGenerate() {
    if (!topic.trim()) {
      toast.error("Please enter a topic or idea");
      return;
    }
    if (!audience.trim()) {
      toast.error("Please describe your target audience");
      return;
    }

    setGenerating(true);
    setPlanError(false);

    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          length,
          audience,
          outputLanguage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "PLAN_REQUIRED") {
          setPlanError(true);
          return;
        }
        toast.error(data.error || "Something went wrong");
        return;
      }

      setGeneratedContent(data.content);
      setEditedContent(data.content);
      setPostId(data.postId);
      setStep("preview");
      toast.success("Blog post generated!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          tone,
          length,
          audience,
          outputLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      setGeneratedContent(data.content);
      setEditedContent(data.content);
      setPostId(data.postId);
      toast.success("Regenerated!");
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function togglePlatform(platform: Platform) {
    if (isFreePlan && !FREE_PLATFORMS_SET.has(platform)) return;
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  async function handleRepurpose() {
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setRepurposing(true);
    setRepurposeOutputs([]);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: "text",
          content: editedContent,
          platforms: selectedPlatforms,
          outputLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      setRepurposeOutputs(data.outputs);
      setStep("repurpose");
      toast.success(
        `Repurposed to ${data.outputs.length} platforms!`
      );
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setRepurposing(false);
    }
  }

  async function handleCopy(text: string, key?: string) {
    await navigator.clipboard.writeText(text);
    if (key) {
      setCopiedPlatform(key);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast.success("Copied to clipboard!");
  }

  if (planError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="rounded-full bg-violet-100 dark:bg-violet-900/30 p-4 mb-6">
          <Lock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Unlock AI Content Starter</h1>
        <p className="text-muted-foreground max-w-md mb-6">
          Generate original blog posts from just a topic, then auto-repurpose to
          every platform. Available on Pro and Agency plans.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setPlanError(false);
              setStep("form");
            }}
          >
            Go Back
          </Button>
          <Button asChild>
            <a href="/dashboard/settings">
              Upgrade to Pro — ${PLANS.PRO.monthlyPrice}/mo
              <ArrowRight className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-2">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Content Starter</h1>
          <p className="text-muted-foreground mt-0.5">
            Describe your topic. AI writes the blog. Then repurpose everywhere.
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        <StepIndicator
          number={1}
          label="Describe"
          active={step === "form"}
          completed={step === "preview" || step === "repurpose"}
        />
        <div className="h-px w-8 bg-border" />
        <StepIndicator
          number={2}
          label="Review & Edit"
          active={step === "preview"}
          completed={step === "repurpose"}
        />
        <div className="h-px w-8 bg-border" />
        <StepIndicator
          number={3}
          label="Repurpose"
          active={step === "repurpose"}
          completed={false}
        />
      </div>

      {/* Step 1: Form */}
      {step === "form" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What do you want to write about?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="topic">Topic or Idea</Label>
                <Input
                  id="topic"
                  placeholder='e.g., "5 ways remote teams stay productive" or "Why startups should embrace async communication"'
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific — the more detail, the better the output.
                </p>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder='e.g., "startup founders", "freelance designers", "marketing managers"'
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>Tone</Label>
                  <Select
                    value={tone}
                    onValueChange={(v) => setTone(v as ContentTone)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="flex flex-col">
                            <span>{t.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {t.description}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Length</Label>
                  <Select
                    value={length}
                    onValueChange={(v) => setLength(v as ContentLength)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LENGTH_OPTIONS.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          <span className="flex flex-col">
                            <span>{l.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {l.description}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select
                    value={outputLanguage}
                    onValueChange={(v) =>
                      setOutputLanguage(v as OutputLanguage)
                    }
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Writing your post...
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5 mr-2" />
                Generate Blog Post
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2: Preview & Edit */}
      {step === "preview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Your Generated Blog Post
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    )}
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(editedContent)}
                  >
                    {copied ? (
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
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] resize-y font-mono text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Edit the content above before repurposing, or use it as-is.
              </p>
            </CardContent>
          </Card>

          {/* Platform selection for repurpose */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Select Platforms to Repurpose To
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SUPPORTED_PLATFORMS.map((platform) => {
                  const isLocked = isFreePlan && !FREE_PLATFORMS_SET.has(platform.id);
                  return (
                    <Badge
                      key={platform.id}
                      variant={
                        selectedPlatforms.includes(platform.id as Platform)
                          ? "default"
                          : "outline"
                      }
                      className={`text-sm py-1.5 px-3 transition-colors ${
                        isLocked
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() => !isLocked && togglePlatform(platform.id as Platform)}
                      title={
                        isLocked
                          ? "Upgrade to Pro for Instagram, Facebook, Reddit"
                          : undefined
                      }
                    >
                      {isLocked && <Lock className="h-3 w-3 mr-1" />}
                      {selectedPlatforms.includes(platform.id as Platform) && !isLocked && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {platform.name}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setStep("form")}
            >
              Back to Edit Settings
            </Button>
            <Button
              size="lg"
              className="flex-1 text-lg"
              onClick={handleRepurpose}
              disabled={repurposing}
            >
              {repurposing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Repurposing to {selectedPlatforms.length} platforms...
                </>
              ) : (
                <>
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Repurpose to {selectedPlatforms.length} Platforms
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Repurposed Outputs */}
      {step === "repurpose" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Repurposed to {repurposeOutputs.length} Platforms
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("preview")}
              >
                Back to Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStep("form");
                  setGeneratedContent("");
                  setEditedContent("");
                  setRepurposeOutputs([]);
                  setTopic("");
                  setAudience("");
                  setPostId(null);
                }}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Start New
              </Button>
            </div>
          </div>

          {/* Original blog post (collapsed) */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-muted-foreground">
                  Original Blog Post
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(editedContent)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-32 overflow-y-auto">
                {editedContent.slice(0, 500)}
                {editedContent.length > 500 && "..."}
              </div>
            </CardContent>
          </Card>

          {/* Platform outputs */}
          <div className="grid gap-4 md:grid-cols-2">
            {repurposeOutputs.map((output) => {
              const platformInfo = SUPPORTED_PLATFORMS.find(
                (p) => p.id === output.platform
              );
              return (
                <Card key={output.platform}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {platformInfo?.name || output.platform}
                      </CardTitle>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopy(output.content, output.platform)
                        }
                      >
                        {copiedPlatform === output.platform ? (
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
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {output.content}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
          completed
            ? "bg-violet-600 text-white"
            : active
              ? "bg-violet-600 text-white ring-2 ring-violet-300"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {completed ? <Check className="h-3.5 w-3.5" /> : number}
      </div>
      <span
        className={`font-medium ${
          active || completed
            ? "text-foreground"
            : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
