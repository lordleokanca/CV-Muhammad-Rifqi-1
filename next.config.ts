import type { NextConfig } from "next";

// GitHub Pages serves the site from a sub-folder (https://<user>.github.io/<repo>/).
// The deploy workflow sets NEXT_PUBLIC_BASE_PATH=/<repo>; leave it empty for Vercel or local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export", // writes a static site to ./out
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
