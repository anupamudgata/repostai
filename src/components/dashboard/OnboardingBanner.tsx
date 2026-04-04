"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { X, Check, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "repostai_onboarding_dismissed_v2";

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
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

export default function OnboardingBanner() {
  const alreadyDismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [localDismissed, setLocalDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ChecklistState>({
    hasConnectedAccount: false,
    hasRepurposed: false,
    hasPosted: false,
  });

  useEffect(() => {
    if (alreadyDismissed || localDismissed) return;

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
        const hasPosted = false; // no posted count in /api/me yet — stays unchecked until we add it

        const newState = { hasConnectedAccount, hasRepurposed, hasPosted };
        setState(newState);

        // Auto-dismiss when all steps done
        if (hasConnectedAccount && hasRepurposed && hasPosted) {
          localStorage.setItem(STORAGE_KEY, "true");
          setLocalDismissed(true);
        }
      } catch {
        // silently fail — banner just shows unchecked
      } finally {
        setLoading(false);
      }
    }

    void check();
  }, [alreadyDismissed, localDismissed]);

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

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
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

      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-base sm:text-lg font-bold tracking-tight">
          {allDone ? "You're all set!" : "Get started with RepostAI"}
        </h2>
        {!loading && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {doneCount}/{steps.length} done
          </span>
        )}
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
    </div>
  );
}
