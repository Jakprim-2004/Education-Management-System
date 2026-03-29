import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable static prerendering for all pages — they all use client-side hooks */
  experimental: {},
};

export default nextConfig;
