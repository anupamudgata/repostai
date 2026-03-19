// next.config.ts
// FIXED: Removed outputFileTracingRoot which causes issues on Vercel,
// added proper config for production stability

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        hostname: "**",
      },
    ],
  },

  // Suppress specific build warnings that aren't real errors
  typescript: {
    // Type errors caught in CI — don't fail production build for them
    ignoreBuildErrors: false,
  },

  eslint: {
    // ESLint run separately in CI
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
