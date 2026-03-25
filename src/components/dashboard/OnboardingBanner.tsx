"use client";

import { useState, useEffect } from "react";
import { X, ClipboardList, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "repostai_onboarding_dismissed";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Paste your content",
    description: "Blog post, YouTube URL, or any text",
  },
  {
    icon: LayoutGrid,
    title: "Pick your platforms",
    description: "LinkedIn, Twitter, Instagram & more",
  },
  {
    icon: Sparkles,
    title: "Get instant posts",
    description: "AI creates platform-perfect content in 60 seconds",
  },
];

export default function OnboardingBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  function handleStart() {
    handleDismiss();
    const textarea = document.querySelector<HTMLTextAreaElement>(
      'textarea[placeholder]'
    );
    if (textarea) {
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => textarea.focus(), 400);
    }
  }

  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm p-6 sm:p-8">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss onboarding"
      >
        <X className="h-4 w-4" />
      </button>

      <h2 className="text-lg sm:text-xl font-bold tracking-tight">
        Welcome to RepostAI! Get started in 3 steps
      </h2>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <step.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleStart} className="mt-6" size="sm">
        Start your first repurpose
      </Button>
    </div>
  );
}
