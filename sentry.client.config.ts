// sentry.client.config.ts — place in project ROOT
import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN && process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.01,
    integrations: [
      Sentry.replayIntegration({ maskAllText: true, blockAllMedia: false }),
      Sentry.feedbackIntegration({ colorScheme: "system", showBranding: false, triggerLabel: "Report a bug" }),
    ],
    beforeSend(event, hint) {
      const error = hint.originalException;
      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("network request failed") || msg.includes("failed to fetch") || msg.includes("load failed")) return null;
      }
      return event;
    },
  });
}
