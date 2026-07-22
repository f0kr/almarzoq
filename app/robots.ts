import type { MetadataRoute } from "next";

const BASE_URL = "https://www.almrzoq.academy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated / gated surfaces: no public content to index, and
      // crawling them just burns crawl budget on sign-in redirects.
      disallow: [
        "/api/",
        "/teacher/",
        "/dashboard",
        "/sign-in",
        "/sign-up",
        "/courses/",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
