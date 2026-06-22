import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow PDF uploads through Server Actions (default is 1MB).
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
