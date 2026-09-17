import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["emailmd", "mjml"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
