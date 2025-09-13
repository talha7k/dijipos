import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    console.log("Happy development session ;)");
  }

  const nextConfigOptions: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    typedRoutes: true,
  };

  return nextConfigOptions;
};

export default nextConfig;
