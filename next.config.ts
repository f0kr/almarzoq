import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // isomorphic-dompurify pulls in jsdom, which resolves several of its
  // internals through dynamic require(). Next's dependency tracing can't see
  // those, so the package bundles incomplete and the route that imports it
  // fails to instantiate at runtime — a 500 rendered as Next's error page,
  // with nothing thrown inside the handler to log. Keeping it external makes
  // the serverless function load it from node_modules instead.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
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
