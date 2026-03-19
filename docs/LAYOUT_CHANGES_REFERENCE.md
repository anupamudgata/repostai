// src/app/layout.tsx — add these exact changes to your existing layout.tsx
//
// FIX #7: Remove Next.js Dev Toolbar, Grammarly icon, and "Notifications alt+T"
// These appear because:
//   a) Next.js dev toolbar leaks if NODE_ENV check fails
//   b) Grammarly browser extension injects the "N" icon
//   c) Some dev-only UI components were included outside process.env guards
//
// ── CHANGE 1: Add suppressHydrationWarning to <html> ────────────────────────
// This stops Grammarly extension from causing hydration mismatch errors
// and prevents the "N" icon from affecting layout.
//
// Change your <html> tag from:
//   <html lang="en">
// To:
//   <html lang="en" suppressHydrationWarning>
//
//
// ── CHANGE 2: Add this to your <head> section ────────────────────────────────
// Kills any dev tools that leak into production builds

export const ProductionCleanupScript = `
(function() {
  if (typeof window === 'undefined') return;
  function killDevTools() {
    // Next.js dev toolbar
    var toolbar = document.querySelector('nextjs-portal');
    if (toolbar) toolbar.remove();
    // Next.js dev overlay
    var overlay = document.querySelector('[data-nextjs-dialog-overlay]');
    if (overlay) overlay.remove();
    // Any element with "devtools" in id or class
    document.querySelectorAll('[id*="devtools"],[class*="devtools"]').forEach(function(el) { el.remove(); });
  }
  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', killDevTools);
  } else {
    killDevTools();
  }
  // Watch for any that get added later
  var obs = new MutationObserver(killDevTools);
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
`;

// ── CHANGE 3: Add this CSS to your globals.css ───────────────────────────────
// Hides dev-only UI elements by selector

export const DEV_TOOLS_CSS = `
/* FIX #7: Hide dev tools in production */
nextjs-portal,
[data-nextjs-dialog-overlay],
[data-nextjs-toast],
.__next-dev-overlay-backdrop,
.__next-dev-overlay {
  display: none !important;
}
`;

// ── CHANGE 4: In your root layout.tsx, wrap any dev-only components ──────────
// If you have any components like <NotificationPanel> or <DevButton>
// that should only show in development, wrap them like this:

export function DevOnlyWrapper({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== "development") return null;
  return <>{children}</>;
}

// ── CHANGE 5: Check your vercel.json / Vercel settings ───────────────────────
// Go to: Vercel → Your Project → Settings → Environment Variables
// Make sure NODE_ENV is NOT manually set to "development" in production scope
// Vercel automatically sets NODE_ENV=production — only override in Preview/Dev scopes
//
// Also confirm: your production deployment shows "production" in Vercel's
// deployment details page. If you see "preview" mode, the dev toolbar may show.

// ── HOW TO APPLY CHANGE 1 + 2 + 3 IN YOUR layout.tsx ────────────────────────
/*
import type { Metadata } from "next";
import { PostHogProvider } from "@/providers/PostHogProvider";

export const metadata: Metadata = {
  title: "RepostAI",
  description: "One post. Every platform. Under 60 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>   // ← ADD suppressHydrationWarning
      <head>
        {process.env.NODE_ENV === "production" && (
          <script
            dangerouslySetInnerHTML={{ __html: ProductionCleanupScript }}
          />
        )}
      </head>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
*/
