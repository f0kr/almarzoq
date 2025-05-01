import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lf9h2aefut.ufs.sh",
      },
    ]
  },
};

export default nextConfig;
