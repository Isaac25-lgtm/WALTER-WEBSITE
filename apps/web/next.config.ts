import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
    transpilePackages: ["@ats/contracts", "@ats/config", "@neondatabase/auth"],
};

export default nextConfig;
