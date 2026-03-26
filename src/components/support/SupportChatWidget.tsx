"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SupportMarkdown } from "@/components/support/SupportMarkdown";
import { SUPPORT_EMAIL } from "@/config/constants";

type SessionPayload = {
  sessionId: string;
  status: string;
  messages: UIMessage[];
  /** false when OPENAI_API_KEY is not set (e.g. Vercel env). */
  supportChatAvailable?: boolean;
};

function formatChatTransportError(err: Error | undefined): string {
  if (!err?.message) return "Could not reach support chat. Please try again.";
  const raw = err.message.trim();
  try {
    const j = JSON.parse(raw) as { error?: string };
    if (j?.error && typeof j.error === "string") return j.error;
  } catch {
    /* plain text error from fetch */
  }
  if (raw.length > 200) return `${raw.slice(0, 200)}…`;
  return raw;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-pulse rounded-full bg-primary/50"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </div>
  );
}

function textFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function SupportChatPanel({
  sessionId,
  initialMessages,
  initialStatus,
  supportChatAvailable,
}: {
  sessionId: string;
  initialMessages: UIMessage[];
  initialStatus: string;
  supportChatAvailable: boolean;
}) {
  const [sessionStatus, setSessionStatus] = useState(initialStatus);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionStatus(initialStatus);
  }, [initialStatus]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        credentials: "include",
        api: "/api/chat",
        body: { sessionId },
      }),
    [sessionId]
  );

  const { messages, sendMessage, status, error, clearError } = useChat({
    id: sessionId,
    messages: initialMessages,
    transport,
    onFinish: async () => {
      const r = await fetch("/api/support/chat/session", { credentials: "include" });
      if (r.ok) {
        const j = (await r.json()) as SessionPayload;
        setSessionStatus(j.status);
      }
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";
  const needsHuman = sessionStatus === "needs_human";
  const canSend = supportChatAvailable && !needsHuman;

  const submitDraft = useCallback(async () => {
    const text = input.trim();
    if (!text || busy || !canSend) return;
    clearError();
    setInput("");
    await sendMessage({ text });
  }, [input, busy, canSend, sendMessage, clearError]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitDraft();
  };

  return (
    <div
      className={cn(
        "flex max-h-[min(560px,calc(100vh-6rem))] w-[min(100vw-1.5rem,400px)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-primary/10"
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-border/60 bg-gradient-to-br from-primary/15 via-card to-card px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">RepostAI Support</h2>
              <p className="text-xs text-muted-foreground">
                Repurpose help · हिंदी · मराठी · తెలుగు &amp; more
              </p>
            </div>
          </div>
        </div>
      </header>

      {!supportChatAvailable && (
        <div className="border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          AI chat isn&apos;t configured on this deployment (missing OpenAI key). Please email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </div>
      )}

      {needsHuman && (
        <div className="border-b border-amber-500/25 bg-amber-500/10 px-4 py-2 text-xs text-amber-950 dark:text-amber-100">
          You&apos;re on our human queue — we&apos;ll email you shortly. This chat is read-only until then.
        </div>
      )}

      {error && (
        <div className="border-b border-destructive/25 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <span>{formatChatTransportError(error)}</span>
          <button
            type="button"
            onClick={() => clearError()}
            className="ml-2 font-medium underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-[220px] flex-1 space-y-3 overflow-y-auto bg-muted/20 px-4 py-3"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Hi! I&apos;m the RepostAI support assistant. Ask about plans, regional languages, repurposing, or billing
            — or type <strong className="text-foreground">talk to a human</strong> anytime.
          </p>
        )}
        {messages.map((m) => {
          const isUser = m.role === "user";
          const bodyText = textFromParts(m.parts);
          return (
            <div
              key={m.id}
              className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                  isUser
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md border border-border/50 bg-card text-card-foreground"
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{bodyText}</p>
                ) : bodyText ? (
                  <SupportMarkdown text={bodyText} className="text-sm" />
                ) : null}
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-border/50 bg-card px-4 py-1 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="shrink-0 border-t border-border/60 bg-card p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submitDraft();
              }
            }}
            placeholder={
              !supportChatAvailable
                ? "Chat unavailable — use email…"
                : needsHuman
                  ? "Human follow-up by email…"
                  : "Ask about RepostAI…"
            }
            disabled={busy || !canSend}
            rows={2}
            className="min-h-[44px] resize-none bg-background text-sm"
            aria-label="Message RepostAI support"
          />
          <Button
            type="submit"
            size="icon"
            disabled={busy || !canSend || !input.trim()}
            className="h-[44px] w-11 shrink-0 rounded-xl"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  /** Bumps when user hits Retry so we refetch without toggling `open`. */
  const [sessionRetryKey, setSessionRetryKey] = useState(0);

  /** Open panel + no payload yet + no error ⇒ session fetch in progress (avoids setState in effect). */
  const loadingSession = open && !session && !loadError;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const ac = new AbortController();
    const timeoutMs = 25_000;
    const tid = setTimeout(() => ac.abort(), timeoutMs);

    fetch("/api/support/chat/session", {
      credentials: "include",
      signal: ac.signal,
    })
      .then(async (r) => {
        const text = await r.text();
        let j: unknown;
        try {
          j = text ? JSON.parse(text) : {};
        } catch {
          throw new Error("Invalid response from server");
        }
        if (!r.ok) {
          const msg =
            (j as { error?: string }).error ||
            (r.status === 401
              ? "Sign in to use support chat."
              : "Could not load chat");
          throw new Error(msg);
        }
        const data = j as Partial<SessionPayload>;
        if (!data.sessionId || typeof data.sessionId !== "string") {
          throw new Error("Could not start support session (missing session id). Is the chat migration applied?");
        }
        return {
          sessionId: data.sessionId,
          status: typeof data.status === "string" ? data.status : "open",
          messages: Array.isArray(data.messages) ? data.messages : [],
          supportChatAvailable: data.supportChatAvailable !== false,
        } satisfies SessionPayload;
      })
      .then((payload) => {
        if (!cancelled) setSession(payload);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const err = e instanceof Error ? e : new Error(String(e));
        if (err.name === "AbortError") {
          setLoadError(
            `Request timed out after ${timeoutMs / 1000}s. Check your network and that Supabase env vars are set.`
          );
          return;
        }
        setLoadError(err.message || "Could not load chat");
      })
      .finally(() => {
        clearTimeout(tid);
      });

    return () => {
      cancelled = true;
      ac.abort();
      clearTimeout(tid);
    };
  }, [open, sessionRetryKey]);

  const close = () => {
    setOpen(false);
    setSession(null);
    setLoadError(null);
  };

  const openPanel = () => {
    setSession(null);
    setLoadError(null);
    setSessionRetryKey((k) => k + 1);
    setOpen(true);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3">
      {open && (
        <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={close}
            className="absolute -right-1 -top-1 z-10 h-8 w-8 rounded-full border border-border bg-card shadow-md"
            aria-label="Close support chat"
          >
            <X className="h-4 w-4" />
          </Button>
          {loadingSession && (
            <div className="flex h-64 w-[min(100vw-1.5rem,400px)] items-center justify-center rounded-2xl border bg-card text-sm text-muted-foreground">
              Loading your conversation…
            </div>
          )}
          {loadError && !loadingSession && (
            <div className="flex h-48 w-[min(100vw-1.5rem,400px)] flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-4 text-center text-sm text-muted-foreground">
              {loadError}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setLoadError(null);
                  setSessionRetryKey((k) => k + 1);
                }}
              >
                Retry
              </Button>
            </div>
          )}
          {session && !loadingSession && !loadError && (
            <SupportChatPanel
              key={session.sessionId}
              sessionId={session.sessionId}
              initialMessages={session.messages}
              initialStatus={session.status}
              supportChatAvailable={session.supportChatAvailable !== false}
            />
          )}
        </div>
      )}
      <Button
        type="button"
        onClick={() => (open ? close() : openPanel())}
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-[1.02] active:scale-[0.98]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? "Close RepostAI support" : "Open RepostAI support"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  );
}
