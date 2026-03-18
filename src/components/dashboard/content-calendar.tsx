"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_PLATFORMS } from "@/config/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ScheduledPostData = {
  id: string;
  platform: string;
  scheduled_at: string;
  status: string;
  posted_at: string | null;
  error_message: string | null;
  created_at: string;
  repurpose_outputs?:
    | {
        generated_content: string | null;
        edited_content: string | null;
      }
    | {
        generated_content: string | null;
        edited_content: string | null;
      }[]
    | null;
};

function getOutputContent(post: ScheduledPostData): string {
  const out = post.repurpose_outputs;
  if (!out) return "";
  const obj = Array.isArray(out) ? out[0] : out;
  return obj?.edited_content ?? obj?.generated_content ?? "";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    linkedin: "bg-[#0A66C2]/15 text-[#0A66C2] border-[#0A66C2]/30",
    twitter_thread: "bg-[#1DA1F2]/15 text-[#1DA1F2] border-[#1DA1F2]/30",
    twitter_single: "bg-[#1DA1F2]/15 text-[#1DA1F2] border-[#1DA1F2]/30",
    instagram: "bg-gradient-to-r from-[#f09433]/20 to-[#e1306c]/20 text-[#e1306c] border-[#e1306c]/30",
    facebook: "bg-[#1877F2]/15 text-[#1877F2] border-[#1877F2]/30",
    default: "bg-primary/10 text-primary border-primary/20",
  };
  return colors[platform] ?? colors.default;
}

function getPlatformName(platform: string): string {
  return SUPPORTED_PLATFORMS.find((p) => p.id === platform)?.name ?? platform;
}

function truncate(str: string, len: number): string {
  if (!str || str.length <= len) return str || "";
  return str.slice(0, len).trim() + "…";
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const daysInMonth = last.getDate();
  const total = daysInMonth + startPad;
  const weeks = Math.ceil(total / 7);
  const cells = weeks * 7;
  const out: Date[] = [];

  for (let i = 0; i < cells; i++) {
    const dayOfMonth = i - startPad + 1;
    if (dayOfMonth < 1) {
      const prevMonth = new Date(year, month, 0);
      out.push(new Date(year, month - 1, prevMonth.getDate() + dayOfMonth));
    } else if (dayOfMonth > daysInMonth) {
      out.push(new Date(year, month + 1, dayOfMonth - daysInMonth));
    } else {
      out.push(new Date(year, month, dayOfMonth));
    }
  }
  return out;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

function isCurrentMonth(d: Date, year: number, month: number): boolean {
  return d.getFullYear() === year && d.getMonth() === month;
}

interface ContentCalendarProps {
  posts: ScheduledPostData[];
  onRefresh: () => void;
}

export function ContentCalendar({ posts: initialPosts, onRefresh }: ContentCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [posts, setPosts] = useState(initialPosts);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const days = getDaysInMonth(year, month);

  const postsByDate = useCallback(() => {
    const map: Record<string, ScheduledPostData[]> = {};
    for (const p of posts) {
      if (p.status !== "pending") continue;
      const key = toDateKey(new Date(p.scheduled_at));
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    }
    return map;
  }, [posts]);

  const byDate = postsByDate();

  const handlePrevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleReschedule = async (postId: string, newDate: Date) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const old = new Date(post.scheduled_at);
    newDate.setHours(old.getHours(), old.getMinutes(), old.getSeconds(), 0);
    const res = await fetch(`/api/schedule/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: newDate.toISOString() }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to reschedule");
      return;
    }
    toast.success("Post rescheduled");
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, scheduled_at: newDate.toISOString() } : p
      )
    );
    onRefresh();
  };

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);
    const res = await fetch(`/api/schedule/${postId}`, { method: "DELETE" });
    const data = await res.json();
    setDeletingId(null);
    if (!res.ok) {
      toast.error(data.error || "Failed to delete");
      return;
    }
    toast.success("Post removed");
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    onRefresh();
  };

  const onDragStart = (e: React.DragEvent, postId: string) => {
    setDraggingId(postId);
    e.dataTransfer.setData("text/plain", postId);
    e.dataTransfer.effectAllowed = "move";
    (e.target as HTMLElement).style.opacity = "0.5";
  };

  const onDragEnd = (e: React.DragEvent) => {
    setDraggingId(null);
    setDropTarget(null);
    (e.target as HTMLElement).style.opacity = "1";
  };

  const onDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggingId) setDropTarget(dateKey);
  };

  const onDragLeave = () => {
    setDropTarget(null);
  };

  const onDrop = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    setDropTarget(null);
    const postId = e.dataTransfer.getData("text/plain");
    if (!postId || !draggingId) return;
    const [y, m, d] = dateKey.split("-").map(Number);
    handleReschedule(postId, new Date(y, m - 1, d));
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Content Calendar</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Drag posts to reschedule • Spot gaps at a glance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[160px] text-center font-medium">
              {MONTHS[month]} {year}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr min-h-[480px]">
            {days.map((day, i) => {
              const dateKey = toDateKey(day);
              const dayPosts = byDate[dateKey] ?? [];
              const isCurrent = isCurrentMonth(day, year, month);
              const isTodayCell = isToday(day);
              const isDropTarget = dropTarget === dateKey;

              return (
                <div
                  key={i}
                  draggable={false}
                  onDragOver={(e) => onDragOver(e, dateKey)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, dateKey)}
                  className={cn(
                    "min-h-[100px] border-b border-r border-border/50 p-1.5 flex flex-col transition-colors",
                    !isCurrent && "bg-muted/30",
                    isTodayCell && "bg-primary/5",
                    isDropTarget && "ring-2 ring-primary ring-inset bg-primary/10"
                  )}
                >
                  <div
                    className={cn(
                      "text-xs font-medium mb-1 flex-shrink-0",
                      isCurrent ? "text-foreground" : "text-muted-foreground",
                      isTodayCell && "text-primary font-semibold"
                    )}
                  >
                    {day.getDate()}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto min-h-0">
                    {dayPosts.length === 0 && isCurrent && (
                      <div className="flex-1 min-h-[60px] rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground/60">No posts</span>
                      </div>
                    )}
                    {dayPosts.map((post) => {
                      const content = getOutputContent(post);
                      const preview = truncate(content, 50);
                      const time = new Date(post.scheduled_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, post.id)}
                          onDragEnd={onDragEnd}
                          className={cn(
                            "group flex items-start gap-1.5 rounded-lg border bg-background p-2 cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
                            draggingId === post.id && "opacity-50 pointer-events-none"
                          )}
                        >
                          <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] font-medium px-1.5 py-0",
                                  getPlatformColor(post.platform)
                                )}
                              >
                                {getPlatformName(post.platform)}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">{time}</span>
                            </div>
                            {preview && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {preview}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Remove from schedule"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingId === post.id}
                          >
                            {deletingId === post.id ? (
                              <span className="animate-pulse text-destructive">…</span>
                            ) : (
                              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary/5" /> Today
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted/50" /> Other month
          </span>
          <span>Drag posts to reschedule</span>
        </div>
      </div>
  );
}
