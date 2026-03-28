// next.config.ts
// FIXED: Removed outputFileTracingRoot which causes issues on Vercel,
// added proper config for production stability

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

/** Pin Turbopack when a parent folder has another package.json/lockfile (avoids wrong root + broken CSS resolve).
 * `npm run dev` uses `--webpack` because Turbopack can resolve `@import "tailwindcss"` from a parent dir (e.g. ~/package.json). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "@aws-sdk/client-s3"],
  turbopack: {
    root: projectRoot,
  },
  // Vercel handles file tracing automatically — don't override it
  // The outputFileTracingRoot you had was causing deployment instability

  experimental: {
    // Increase server action body size limit for PDF uploads
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },

  // Suppress specific build warnings that aren't real errors
  typescript: {
    // Type errors caught in CI — don't fail production build for them
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
