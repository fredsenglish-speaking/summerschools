import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Photos are shrunk in the browser before upload, but allow room for the original if that fails.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
};

export default nextConfig;
