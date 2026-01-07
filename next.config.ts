import type { NextConfig } from "next";
import path from "path";
console.log('next.config.js loaded from', __dirname); // temporary debug line

const nextConfig: NextConfig = {
  devIndicators: {
  position: "top-right",
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
