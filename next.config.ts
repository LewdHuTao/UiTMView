import type { NextConfig } from "next";
import { execSync } from "child_process";

const gitSha = (() => {
  try {
    return execSync("git rev-parse HEAD").toString().trim();
  } catch {
    return "dev";
  }
})();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GIT_COMMIT_SHA: gitSha,
  },
  cacheComponents: false,
  reactStrictMode: false,
  images: {
    qualities: [100],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
