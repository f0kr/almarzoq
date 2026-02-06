import { auth } from "@clerk/nextjs/server";
import { getProgress } from "@/actions/getProgress";
import { db } from "@/lib/db";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";
import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get("origin") || undefined);
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      const response = NextResponse.json({
        completedCourses: [],
        coursesInProgress: [],
      });
      return addCorsHeaders(response, req);
    }

    const purchases = await db.purchase.findMany({
      where: { userId },
      select: {
        course: {
          include: {
            category: true,
            chapters: {
              where: { isPublished: true },
              select: { id: true },
            },
            teachers: {
              select: { name: true },
            },
          },
        },
      },
    });

    const courses = purchases.map((purchase) => purchase.course);
    const coursesWithProgress = await Promise.all(
      courses.map(async (course) => {
        const progress = await getProgress(course.id, userId);
        return { ...course, progress };
      })
    );

    const normalizeCourse = (course: (typeof coursesWithProgress)[number]) => ({
      id: course.id,
      title: course.title,
      categoryId: course.categoryId,
      imageUrl: course.imageUrl ?? "",
      chaptersLength: course.chapters.length,
      price: course.price ?? 0,
      progress: course.progress ?? 0,
      category: course.category?.name ?? null,
      masters: course.teachers.map((teacher) => teacher.name),
    });

    const completedCourses = coursesWithProgress
      .filter((course) => (course.progress ?? 0) >= 100)
      .map(normalizeCourse);

    const coursesInProgress = coursesWithProgress
      .filter((course) => (course.progress ?? 0) < 100)
      .map(normalizeCourse);

    const response = NextResponse.json({
      completedCourses,
      coursesInProgress,
    });

    return addCorsHeaders(response, req);
  } catch (error) {
    console.log("[MOBILE_DASHBOARD]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
