import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  
  // Disable ESLint during production builds (optional - remove if you want strict checks)
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Disable TypeScript errors during build (optional - remove for strict mode)
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
