import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 1080, 1920],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
