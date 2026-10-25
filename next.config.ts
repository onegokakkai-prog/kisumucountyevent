import type { NextConfig } from "next";

// Photos uploaded from /admin are served from the R2 bucket's public URL.
const r2PublicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2PublicUrl ? [new URL(`${r2PublicUrl}/**`)] : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
