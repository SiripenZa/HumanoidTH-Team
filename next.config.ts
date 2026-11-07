import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: path.join(process.cwd()),
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;