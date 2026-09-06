import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: 'export', // Commented out to support dynamic routes
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
