"use client";

import { useState } from "react";
import {
  Link as LinkIcon,
  Type,
  Youtube,
  FileText,
  Loader2,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { InputType, Platform } from "@/types";
import { SUPPORTED_PLATFORMS } from "@/config/constants";

const INPUT_TABS = [
  { id: "text" as InputType, label: "Paste Text", icon: Type },
  { id: "url" as InputType, label: "Blog URL", icon: LinkIcon },
  { id: "youtube" as InputType, label: "YouTube", icon: Youtube },
  { id: "pdf" as InputType, label: "PDF", icon: FileText },
];

export default function DashboardPage() {
  const [inputType, setInputType] = useState<InputType>("text");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "linkedin",
    "twitter_thread",
    "twitter_single",
    "instagram",
    "email",
  ]);
  const [outputs, setOutputs] = useState<
    { platform: Platform; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  async function handleRepurpose() {
    if (inputType === "text" && !content.trim()) {
      toast.error("Please paste some content first");
      return;
    }
    if ((inputType === "url" || inputType === "youtube") && !url.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    if (selectedPlatforms.length === 0) {
      toast.error("Select at least one platform");
      return;
    }

    setLoading(true);
    setOutputs([]);

    try {
      const res = await fetch("/api/repurpose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType,
          content: inputType === "text" ? content : "Fetching from URL...",
          url: inputType !== "text" ? url : undefined,
          platforms: selectedPlatforms,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      setOutputs(data.outputs);
      toast.success(`Generated content for ${data.outputs.length} platforms!`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(platform: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedPlatform(null), 2000);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Repurpose Content</h1>
        <p className="text-muted-foreground mt-1">
          Paste your content and generate platform-ready posts in seconds.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            value={inputType}
            onValueChange={(v) => setInputType(v as InputType)}
          >
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              {INPUT_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 text-xs sm:text-sm"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder="Paste your blog post, article, or any text content here..."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div>
                <Label htmlFor="blog-url">Blog Post URL</Label>
                <Input
                  id="blog-url"
                  type="url"
                  placeholder="https://example.com/my-blog-post"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;ll automatically extract the article content.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="youtube" className="mt-4">
              <div>
                <Label htmlFor="yt-url">YouTube Video URL</Label>
                <Input
                  id="yt-url"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  We&apos;ll extract the transcript automatically. The video
                  must have captions enabled.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="mt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  PDF upload coming soon. For now, copy-paste your PDF content
                  into the Text tab.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Output Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_PLATFORMS.map((platform) => (
              <Badge
                key={platform.id}
                variant={
                  selectedPlatforms.includes(platform.id as Platform)
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer text-sm py-1.5 px-3 transition-colors"
                onClick={() => togglePlatform(platform.id as Platform)}
              >
                {selectedPlatforms.includes(platform.id as Platform) && (
                  <Check className="h-3 w-3 mr-1" />
                )}
                {platform.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        size="lg"
        className="w-full text-lg"
        onClick={handleRepurpose}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Generating ({selectedPlatforms.length} platforms)...
          </>
        ) : (
          <>
            <RefreshCw className="h-5 w-5 mr-2" />
            Repurpose to {selectedPlatforms.length} Platforms
          </>
        )}
      </Button>

      {/* Output Section */}
      {outputs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Generated Content</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {outputs.map((output) => {
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
                          handleCopy(output.platform, output.content)
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
