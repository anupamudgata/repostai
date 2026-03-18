import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    return [
      { source: "/dashboard/calendar", destination: "/dashboard/scheduled", permanent: true },
    ];
  },
};

export default nextConfig;
