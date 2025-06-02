import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' https://analytics.tiktok.com 'sha256-W+y2eHzc9i5el1db9QMo9xqkKryyTN7S51duRkzq5Rg=';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
