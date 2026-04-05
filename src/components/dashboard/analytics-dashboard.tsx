"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Plus,
  ChevronRight,
  Loader2,
  BarChart3,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_PLATFORMS } from "@/config/constants";
import { useAppToast } from "@/hooks/use-app-toast";

type PostRow = {
  id: string;
  platform: string;
  posted_at: string;
  content_preview?: string | null;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  clicks: number;
  hasEngagement?: boolean;
  scheduled_post_id?: string | null;
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
  twitter_thread: "#1DA1F2",
  twitter_single: "#1DA1F2",
  instagram: "#E1306C",
  facebook: "#1877F2",
};


function getPlatformName(platform: string) {
  return SUPPORTED_PLATFORMS.find((p) => p.id === platform)?.name ?? platform;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function AnalyticsDashboard({ initialPosts }: { initialPosts: PostRow[] }) {
  const toastT = useAppToast();
  const [posts, setPosts] = useState(initialPosts);
  const [insights, setInsights] = useState<string[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [engagementChartPlatform, setEngagementChartPlatform] =
    useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    platform: "linkedin",
    postedAt: new Date().toISOString().slice(0, 16),
    contentPreview: "",
    likes: 0,
    comments: 0,
    shares: 0,
    impressions: 0,
  });

  const refresh = () => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => {});
  };

  useEffect(() => {
    refresh();
  }, []);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/analytics/insights");
      const data = await res.json();
      setInsights(data.insights ?? []);
    } catch {
      toastT.error("toast.failedLoadInsights");
    } finally {
      setInsightsLoading(false);
    }
  }, [toastT]);

  useEffect(() => {
    if (posts.filter((p) => p.hasEngagement || (p.likes + p.comments + p.shares) > 0).length >= 2) {
      void fetchInsights();
    }
  }, [posts, fetchInsights]);

  const totals = useMemo(() => {
    let likes = 0, comments = 0, shares = 0, impressions = 0;
    for (const p of posts) {
      likes += p.likes ?? 0;
      comments += p.comments ?? 0;
      shares += p.shares ?? 0;
      impressions += p.impressions ?? 0;
    }
    return {
      engagement: likes + comments + shares,
      likes,
      comments,
      shares,
      impressions,
      postCount: posts.length,
    };
  }, [posts]);

  const chartData = useMemo(() => {
    const byPlatform: Record<string, number> = {};
    for (const p of posts) {
      const eng = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0);
      if (eng > 0) {
        byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + eng;
      }
    }
    return Object.entries(byPlatform).map(([name, value]) => ({
      name: getPlatformName(name),
      value,
      fill: PLATFORM_COLORS[name] ?? "#6366f1",
    }));
  }, [posts]);

  const engagementChartPlatformOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const p of posts) {
      const eng = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0);
      if (eng > 0) ids.add(p.platform);
    }
    return Array.from(ids);
  }, [posts]);

  const timelineData = useMemo(() => {
    const list =
      engagementChartPlatform === "all"
        ? posts
        : posts.filter((p) => p.platform === engagementChartPlatform);
    const byDate: Record<string, { engagement: number; platforms: Set<string> }> =
      {};
    for (const p of list) {
      const eng = (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0);
      if (eng > 0) {
        const d = new Date(p.posted_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!byDate[d]) {
          byDate[d] = { engagement: 0, platforms: new Set() };
        }
        byDate[d].engagement += eng;
        byDate[d].platforms.add(p.platform);
      }
    }
    return Object.entries(byDate)
      .slice(-14)
      .map(([name, row]) => ({
        name,
        engagement: row.engagement,
        platformSummary:
          engagementChartPlatform === "all" && row.platforms.size > 0
            ? Array.from(row.platforms).map(getPlatformName).join(", ")
            : engagementChartPlatform !== "all"
              ? getPlatformName(engagementChartPlatform)
              : undefined,
      }));
  }, [posts, engagementChartPlatform]);

  const topPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) > 0)
        .sort((a, b) => {
          const engA = (a.likes ?? 0) + (a.comments ?? 0) + (a.shares ?? 0);
          const engB = (b.likes ?? 0) + (b.comments ?? 0) + (b.shares ?? 0);
          return engB - engA;
        })
        .slice(0, 5),
    [posts]
  );

  const handleAddEngagement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/analytics/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: form.platform,
          postedAt: new Date(form.postedAt).toISOString(),
          contentPreview: form.contentPreview || undefined,
          likes: form.likes,
          comments: form.comments,
          shares: form.shares,
          impressions: form.impressions,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toastT.success("toast.engagementAdded");
      setAddOpen(false);
      setForm({
        platform: "linkedin",
        postedAt: new Date().toISOString().slice(0, 16),
        contentPreview: "",
        likes: 0,
        comments: 0,
        shares: 0,
        impressions: 0,
      });
      refresh();
    } catch (err) {
      if (err instanceof Error && err.message) {
        toastT.errorFromApi({ error: err.message });
      } else {
        toastT.error("toast.failedAddEngagement");
      }
    } finally {
      setSubmitting(false);
    }
  };

  function handleExportCsv() {
    const header = ["Date", "Platform", "Engagement", "Post Preview"];
    const lines = [header.join(",")];
    for (const p of posts) {
      const date = new Date(p.posted_at).toISOString().slice(0, 10);
      const platform = getPlatformName(p.platform);
      const engagement =
        (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0);
      const rawPreview = (p.content_preview ?? "").replace(/\s+/g, " ").trim();
      const preview = rawPreview.slice(0, 80);
      lines.push(
        [
          escapeCsvCell(date),
          escapeCsvCell(platform),
          escapeCsvCell(String(engagement)),
          escapeCsvCell(preview),
        ].join(",")
      );
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    a.href = href;
    a.download = `repostai-analytics-${dateStr}.csv`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }

  if (posts.length === 0) {
    return (
      <DashboardEmptyState
        icon={BarChart3}
        title="No performance data yet"
        description="Publish or schedule posts, then log engagement to unlock charts and AI insights."
        action={{ label: "Start repurposing", href: "/dashboard/repurpose" }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleExportCsv}
        >
          <Download className="h-4 w-4 shrink-0" />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Engagement</p>
                <p className="text-2xl font-bold">{totals.engagement.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#0A66C2]/10 p-3">
                <Heart className="h-5 w-5 text-[#0A66C2]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Likes</p>
                <p className="text-2xl font-bold">{totals.likes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#1DA1F2]/10 p-3">
                <MessageCircle className="h-5 w-5 text-[#1DA1F2]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-2xl font-bold">{totals.comments.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#E1306C]/10 p-3">
                <Share2 className="h-5 w-5 text-[#E1306C]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shares</p>
                <p className="text-2xl font-bold">{totals.shares.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <span className="text-lg font-bold text-primary">{totals.postCount}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posts Tracked</p>
                <p className="text-2xl font-bold">{totals.postCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Engagement Over Time</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Likes + comments + shares by post date
                </p>
              </div>
              {engagementChartPlatformOptions.length > 0 && (
                <Select
                  value={engagementChartPlatform}
                  onValueChange={setEngagementChartPlatform}
                >
                  <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    {engagementChartPlatformOptions.map((pid) => (
                      <SelectItem key={pid} value={pid}>
                        {getPlatformName(pid)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timelineData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      cursor={{
                        fill: "hsl(var(--muted))",
                        opacity: 0.12,
                      }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload as {
                          name: string;
                          engagement: number;
                          platformSummary?: string;
                        };
                        return (
                          <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md text-popover-foreground">
                            <p className="font-medium">{row.name}</p>
                            <p>
                              {row.engagement.toLocaleString()} engagement
                            </p>
                            {row.platformSummary ? (
                              <p className="text-xs text-muted-foreground mt-1">
                                {row.platformSummary}
                              </p>
                            ) : null}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="engagement" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[240px]">
                <DashboardEmptyState
                  variant="compact"
                  icon={BarChart3}
                  title="No chart data yet"
                  description="Log engagement on your posts to see trends over time."
                  action={{ label: "Log engagement", onClick: () => setAddOpen(true) }}
                  className="h-full min-h-[240px] rounded-lg border-0 bg-muted/20"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement by Platform</CardTitle>
            <p className="text-sm text-muted-foreground">Where your content performs best</p>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: "8px" }}
                      formatter={(value) => [(value ?? 0).toLocaleString(), "Engagement"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[240px]">
                <DashboardEmptyState
                  variant="compact"
                  icon={Share2}
                  title="No platform breakdown yet"
                  description="Add likes, comments, or shares to see which networks drive engagement."
                  action={{ label: "Log engagement", onClick: () => setAddOpen(true) }}
                  className="h-full min-h-[240px] rounded-lg border-0 bg-muted/20"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI-Powered Insights</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInsights}
              disabled={insightsLoading || posts.filter((p) => (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) > 0).length < 2}
            >
              {insightsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh insights"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover patterns like &quot;Your LinkedIn posts perform 3x better on Tuesdays at 10 AM&quot;
          </p>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <ul className="space-y-3">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border bg-background/80 p-4"
                >
                  <ChevronRight className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
            <DashboardEmptyState
              variant="compact"
              icon={Sparkles}
              title="AI insights need more data"
              description="Log engagement for at least two posts and we&apos;ll surface patterns and best times to post."
              action={{ label: "Log engagement", onClick: () => setAddOpen(true) }}
              className="min-h-[200px] border-0 bg-background/50 py-8"
            />
          )}
        </CardContent>
      </Card>

      {/* Top Posts + Add Engagement */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
            <p className="text-sm text-muted-foreground">Ranked by total engagement</p>
          </CardHeader>
          <CardContent>
            {topPosts.length > 0 ? (
              <div className="space-y-3">
                {topPosts.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium">
                          {getPlatformName(p.platform)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm">
                        {(p.content_preview as string)?.slice(0, 100) || "No preview"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(p.posted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-4 text-sm">
                      <span title="Likes">{p.likes ?? 0} ❤️</span>
                      <span title="Comments">{p.comments ?? 0} 💬</span>
                      <span title="Shares">{p.shares ?? 0} ↗️</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <DashboardEmptyState
                variant="compact"
                icon={TrendingUp}
                title="No top posts yet"
                description="Log engagement on your posts to rank what resonates most with your audience."
                action={{ label: "Log engagement", onClick: () => setAddOpen(true) }}
                className="border-0 bg-muted/20 py-10"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Engagement</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manually log likes, comments, shares from your posts
            </p>
          </CardHeader>
          <CardContent>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Log Engagement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Post Engagement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddEngagement} className="space-y-4">
                  <div>
                    <Label>Platform</Label>
                    <Select value={form.platform} onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["linkedin", "twitter", "twitter_thread", "twitter_single", "instagram", "facebook"].map(
                          (p) => (
                            <SelectItem key={p} value={p}>
                              {getPlatformName(p)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Posted at</Label>
                    <Input
                      type="datetime-local"
                      value={form.postedAt}
                      onChange={(e) => setForm((f) => ({ ...f, postedAt: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Content preview (optional)</Label>
                    <Input
                      placeholder="First line of your post..."
                      value={form.contentPreview}
                      onChange={(e) => setForm((f) => ({ ...f, contentPreview: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Likes</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.likes || ""}
                        onChange={(e) => setForm((f) => ({ ...f, likes: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Comments</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.comments || ""}
                        onChange={(e) => setForm((f) => ({ ...f, comments: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Shares</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.shares || ""}
                        onChange={(e) => setForm((f) => ({ ...f, shares: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                    <div>
                      <Label>Impressions</Label>
                      <Input
                        type="number"
                        min={0}
                        value={form.impressions || ""}
                        onChange={(e) => setForm((f) => ({ ...f, impressions: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <p className="mt-4 text-xs text-muted-foreground">
              Paste metrics from LinkedIn, X, or Instagram. AI insights improve with more data.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
