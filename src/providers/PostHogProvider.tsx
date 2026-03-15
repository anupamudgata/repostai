"use client";
import { useEffect, Suspense }               from "react";
import { usePathname, useSearchParams }      from "next/navigation";
import { initPostHog, posthog }              from "@/lib/analytics/posthog.client";

function PostHogPageViewTracker(): null {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => { initPostHog(); }, []);
  useEffect(() => {
    if (!pathname) return;
    let url = window.origin + pathname;
    if (searchParams?.toString()) url += `?${searchParams.toString()}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);
  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <>
      <Suspense fallback={null}><PostHogPageViewTracker /></Suspense>
      {children}
    </>
  );
}
