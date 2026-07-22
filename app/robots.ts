import type { MetadataRoute } from "next";

const BASE_URL = "https://www.almrzoq.academy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated / gated surfaces: no public content to index, and
      // crawling them just burns crawl budget on sign-in redirects.
      // Course landing pages and free lessons under /courses/ ARE public and
      // are handled per-page (locked lessons carry a noindex robots meta), so
      // /courses/ is intentionally not blocked here.
      disallow: [
        "/api/",
        "/teacher/",
        "/dashboard",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
