import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourses } from "@/actions/getCourses";
import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get("origin") || undefined);
}

/**
 * The "Featured" banner surfaces the most-purchased published course. Only
 * computed for the unfiltered feed — the app hides the banner while filtering.
 */
async function getFeatured() {
  const course = await db.course.findFirst({
    where: { isPublished: true },
    orderBy: { purchases: { _count: "desc" } },
    select: {
      id: true,
      title: true,
      imageUrl: true,
      price: true,
      chapters: { where: { isPublished: true }, select: { id: true } },
      teachers: { select: { name: true }, take: 1 },
    },
  });

  if (!course) return null;
  return {
    id: course.id,
    title: course.title,
    imageUrl: course.imageUrl ?? null,
    price: course.price ?? null,
    chaptersLength: course.chapters.length,
    master: course.teachers[0]?.name ?? null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const free = searchParams.get("free") === "1" ? true : undefined;
    const isFiltering = Boolean(title || categoryId || free);

    // Same action the web catalog uses: fuzzy search over titles + teacher
    // names, category filter, and an optional free-only filter.
    const [courses, featured] = await Promise.all([
      getCourses({ userId, title, categoryId, free }),
      isFiltering ? Promise.resolve(null) : getFeatured(),
    ]);

    const response = NextResponse.json({
      featured,
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description ?? null,
        imageUrl: course.imageUrl ?? null,
        price: course.price ?? null,
        createdAt: course.createdAt.toISOString(),
        category: course.category?.name ?? null,
        chaptersLength: course.chapters.length,
        progress: course.progress,
        masters: (course.teachers ?? [])
          .filter((teacher) => teacher.name)
          .map((teacher) => ({
            name: teacher.name,
            profileUrl: teacher.profileUrl ?? null,
          })),
      })),
    });

    return addCorsHeaders(response, req);
  } catch (error) {
    console.log("[MOBILE_HOME]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
