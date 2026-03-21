import * as Sentry from "@sentry/nextjs";

type SeverityLevel = "fatal" | "error" | "warning" | "info" | "debug";

interface CaptureOptions {
  userId?:    string;
  userEmail?: string;
  plan?:      "free" | "starter" | "pro" | "agency";
  action?:    string;
  extra?:     Record<string, unknown>;
  level?:     SeverityLevel;
}

export function captureError(error: unknown, options: CaptureOptions = {}): void {
  const { userId, userEmail, plan, action, extra, level = "error" } = options;
  Sentry.withScope((scope) => {
    if (userId || userEmail) scope.setUser({ id: userId, email: userEmail });
    if (plan)   scope.setTag("plan",   plan);
    if (action) scope.setTag("action", action);
    scope.setLevel(level);
    if (extra) Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: SeverityLevel = "info", options: Omit<CaptureOptions, "level"> = {}): void {
  const { userId, userEmail, plan, action, extra } = options;
  Sentry.withScope((scope) => {
    if (userId || userEmail) scope.setUser({ id: userId, email: userEmail });
    if (plan)   scope.setTag("plan",   plan);
    if (action) scope.setTag("action", action);
    scope.setLevel(level);
    if (extra) Object.entries(extra).forEach(([k, v]) => scope.setExtra(k, v));
    Sentry.captureMessage(message, level);
  });
}

export function withSentryHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<Response>,
  options: { action?: string } = {}
) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      captureError(error, { action: options.action, level: "error" });
      const { NextResponse } = await import("next/server");
      return NextResponse.json({ error: "An unexpected error occurred. Our team has been notified." }, { status: 500 });
    }
  };
}
