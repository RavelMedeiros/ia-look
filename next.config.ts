import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // aplica para todas as rotas
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' https://analytics.tiktok.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;