import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "lf9h2aefut.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "24c595zabd.ufs.sh",
      }
    ]
  },
};

export default nextConfig;
