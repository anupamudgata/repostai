"use client";

import { useRouter } from "next/navigation";
import { ContentCalendar } from "./content-calendar";
import type { ScheduledPostData } from "./content-calendar";

export function ScheduledCalendarWrapper({ posts }: { posts: ScheduledPostData[] }) {
  const router = useRouter();
  return (
    <ContentCalendar
      posts={posts}
      onRefresh={() => router.refresh()}
    />
  );
}
