import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/leaderboard-beta",
        destination: "/leaderboard",
        permanent: true,
      },
      {
        source: "/verify-error",
        destination: "/verify/error",
        permanent: true,
      },
      {
        source: "/verify-success",
        destination: "/verify/success",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
