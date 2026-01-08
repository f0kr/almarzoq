import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
  position: "bottom-right",
  },
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
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com"
      }
    ]
  },
};

export default nextConfig;
