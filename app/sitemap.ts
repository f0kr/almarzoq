import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = "https://www.almrzoq.academy";

// Rendered per request, never at build time. With ISR the build tries to
// prerender this route, which turns a DB outage (or a build env with no
// database reachable) into a failed deploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/masters`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    const [masters, courses] = await Promise.all([
      // Only published masters are publicly reachable, so only those belong here.
      db.teacher.findMany({
        where: { isPublished: true },
        select: { id: true, updatedAt: true },
      }),
      // Published courses that have at least one published chapter get a
      // landing page; their free chapters are the only indexable lessons.
      db.course.findMany({
        where: {
          isPublished: true,
          chapters: { some: { isPublished: true } },
        },
        select: {
          id: true,
          updatedAt: true,
          chapters: {
            where: { isPublished: true, isFree: true },
            select: { id: true, updatedAt: true },
          },
        },
      }),
    ]);

    const masterRoutes: MetadataRoute.Sitemap = masters.map((master) => ({
      url: `${BASE_URL}/masters/${master.id}`,
      lastModified: master.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const courseRoutes: MetadataRoute.Sitemap = courses.flatMap((course) => [
      {
        url: `${BASE_URL}/courses/${course.id}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.9,
      },
      ...course.chapters.map((chapter) => ({
        url: `${BASE_URL}/courses/${course.id}/chapters/${chapter.id}`,
        lastModified: chapter.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
    ]);

    return [...staticRoutes, ...masterRoutes, ...courseRoutes];
  } catch (error) {
    // Degrade to the static routes rather than throwing: a 500 here makes
    // Search Console reject the whole sitemap, which is worse than a partial one.
    console.error("[sitemap] failed to build dynamic routes:", error);
    return staticRoutes;
  }
}
