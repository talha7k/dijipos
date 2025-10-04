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
    experimental: {
      useLightningcss: false,  // Fallback to standard PostCSS if this is the culprit
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "firebasestorage.googleapis.com",
        },
      ],
    },
    async headers() {
      return [
        {
          source: "/login",
          headers: [
            {
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin-allow-popups",
            },
          ],
        },
      ];
    },
  };

  return nextConfigOptions;
};

export default nextConfig;
