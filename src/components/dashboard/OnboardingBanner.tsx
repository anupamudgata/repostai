"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { X, Check, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEYS = [
  "repostai_onboarding_dismissed",
  "repostai_onboarding_dismissed_v2",
] as const;
const PROGRESS_KEY = "repostai_onboarding_v1";

function isDismissedInStorage(): boolean {
  if (typeof window === "undefined") return false;
  return DISMISS_KEYS.some((k) => localStorage.getItem(k) === "true");
}

function getSnapshot(): boolean {
  return isDismissedInStorage();
}
function getServerSnapshot(): boolean {
  return true;
}
function subscribe(cb: () => void): () => void {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

type ChecklistState = {
  hasConnectedAccount: boolean;
  hasRepurposed: boolean;
  hasPosted: boolean;
};

function emptyChecklist(): ChecklistState {
  return {
    hasConnectedAccount: false,
    hasRepurposed: false,
    hasPosted: false,
  };
}

function readProgressFromStorage(): ChecklistState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return emptyChecklist();
    const p = JSON.parse(raw) as Partial<ChecklistState>;
    if (!p || typeof p !== "object") return emptyChecklist();
    return {
      hasConnectedAccount: !!p.hasConnectedAccount,
      hasRepurposed: !!p.hasRepurposed,
      hasPosted: !!p.hasPosted,
    };
  } catch {
    return emptyChecklist();
  }
}

export default function OnboardingBanner() {
  const alreadyDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [localDismissed, setLocalDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ChecklistState>(emptyChecklist);

  useEffect(() => {
    if (alreadyDismissed || localDismissed) return;

    const stored = readProgressFromStorage();
    setState((prev) => ({
      hasConnectedAccount: prev.hasConnectedAccount || stored.hasConnectedAccount,
      hasRepurposed: prev.hasRepurposed || stored.hasRepurposed,
      hasPosted: prev.hasPosted || stored.hasPosted,
    }));

    async function check() {
      try {
        const [accountsRes, meRes] = await Promise.all([
          fetch("/api/social/accounts"),
          fetch("/api/me", { cache: "no-store" }),
        ]);
        const accountsData = accountsRes.ok ? await accountsRes.json() : { accounts: [] };
        const meData = meRes.ok ? await meRes.json() : {};

        const hasConnectedAccount = (accountsData.accounts ?? []).some(
          (a: { status: string }) => a.status === "connected"
        );
        const hasRepurposed = (meData.repurposeCount ?? 0) > 0;
        const hasPosted = false;

        const fromApi = { hasConnectedAccount, hasRepurposed, hasPosted };

        setState((prev) => {
          const merged = {
            hasConnectedAccount:
              fromApi.hasConnectedAccount || prev.hasConnectedAccount,
            hasRepurposed: fromApi.hasRepurposed || prev.hasRepurposed,
            hasPosted: fromApi.hasPosted || prev.hasPosted,
          };
          try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
          } catch {
            /* ignore */
          }
          return merged;
        });
      } catch {
        /* silently fail — banner just shows unchecked */
      } finally {
        setLoading(false);
      }
    }

    void check();
  }, [alreadyDismissed, localDismissed]);

  useEffect(() => {
    if (loading || alreadyDismissed || localDismissed) return;
    if (
      state.hasConnectedAccount &&
      state.hasRepurposed &&
      state.hasPosted
    ) {
      try {
        DISMISS_KEYS.forEach((k) => localStorage.setItem(k, "true"));
      } catch {
        /* ignore */
      }
      setLocalDismissed(true);
    }
  }, [
    loading,
    alreadyDismissed,
    localDismissed,
    state.hasConnectedAccount,
    state.hasRepurposed,
    state.hasPosted,
  ]);

  const dismissed = alreadyDismissed || localDismissed;
  if (dismissed) return null;

  const steps = [
    {
      done: state.hasConnectedAccount,
      label: "Connect a social account",
      sub: "LinkedIn, Twitter/X, Instagram or Facebook",
      href: "/dashboard/connections",
      cta: "Connect now",
    },
    {
      done: state.hasRepurposed,
      label: "Repurpose your first content",
      sub: "Paste text, URL or YouTube link and generate posts",
      href: null,
      cta: null,
    },
    {
      done: state.hasPosted,
      label: "Post or schedule to social media",
      sub: "Publish directly from the repurpose output",
      href: null,
      cta: null,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  const ringPx = 40;
  const ringStroke = 3;
  const ringR = (ringPx - ringStroke) / 2 - 0.5;
  const ringCirc = 2 * Math.PI * ringR;
  const ringDashOffset = ringCirc * (1 - doneCount / steps.length);

  function handleDismiss() {
    try {
      DISMISS_KEYS.forEach((k) => localStorage.setItem(k, "true"));
    } catch {
      /* ignore */
    }
    setLocalDismissed(true);
  }

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm p-5 sm:p-7 mb-6">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss onboarding"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 mb-1">
        {!loading && (
          <svg
            width={ringPx}
            height={ringPx}
            viewBox={`0 0 ${ringPx} ${ringPx}`}
            className="shrink-0 mt-0.5"
            aria-hidden
          >
            <circle
              cx={ringPx / 2}
              cy={ringPx / 2}
              r={ringR}
              fill="none"
              className="stroke-muted"
              strokeWidth={ringStroke}
            />
            <circle
              cx={ringPx / 2}
              cy={ringPx / 2}
              r={ringR}
              fill="none"
              className={allDone ? "stroke-green-500" : "stroke-primary"}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCirc}
              strokeDashoffset={ringDashOffset}
              transform={`rotate(-90 ${ringPx / 2} ${ringPx / 2})`}
            />
          </svg>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {allDone ? "You're all set!" : "Get started with RepostAI"}
          </h2>
          {!loading && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {doneCount}/{steps.length} done
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Complete these steps to get your first post live.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking your progress…
        </div>
      ) : (
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors ${
                  step.done
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {step.done ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Circle className="h-2.5 w-2.5 fill-muted-foreground/20" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-tight ${step.done ? "line-through text-muted-foreground" : ""}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.sub}</p>
              </div>
              {!step.done && step.href && (
                <Button asChild size="sm" variant="default" className="shrink-0 h-7 text-xs px-3">
                  <Link href={step.href}>{step.cta}</Link>
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}

      {!loading && doneCount > 0 && !allDone && (
        <p className="text-xs text-muted-foreground mt-4">
          Looking good! Keep going — you&apos;re {doneCount} step{doneCount > 1 ? "s" : ""} in.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleDismiss}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}
