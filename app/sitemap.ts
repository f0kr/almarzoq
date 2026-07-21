import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = "https://www.almrzoq.academy";

export const revalidate = 3600;

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

  // Only published masters are publicly reachable, so only those belong here.
  const masters = await db.teacher.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });

  const masterRoutes: MetadataRoute.Sitemap = masters.map((master) => ({
    url: `${BASE_URL}/masters/${master.id}`,
    lastModified: master.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...masterRoutes];
}
