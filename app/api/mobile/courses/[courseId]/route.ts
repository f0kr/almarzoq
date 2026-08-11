import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourseDuration } from "@/actions/getCourseDuration";
import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

// Where paid-course enrollment sends the student until a payment gateway lands.
// Mirrors the web landing page's ENROLL_CONTACT. Overridable via env.
const ENROLL_CONTACT =
  process.env.ENROLL_CONTACT_URL || "https://t.me/AlmrzoqAcademy";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get("origin") || undefined);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;

    const course = await db.course.findFirst({
      where: { id: courseId, isPublished: true },
      include: {
        category: true,
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: { id: true, title: true, isFree: true },
        },
        teachers: {
          select: { id: true, name: true, profileUrl: true },
        },
        purchases: {
          where: { userId: userId || "" },
          select: { id: true },
        },
      },
    });

    if (!course) {
      const notFound = NextResponse.json({ error: "Not found" }, { status: 404 });
      return addCorsHeaders(notFound, req);
    }

    const isFree = !course.price || course.price === 0;
    const hasAccess = isFree || course.purchases.length > 0;
    const duration = await getCourseDuration(course.id);

    const response = NextResponse.json({
      id: course.id,
      title: course.title,
      imageUrl: course.imageUrl ?? null,
      description: course.description ?? null,
      category: course.category?.name ?? null,
      duration,
      price: course.price ?? null,
      isFree,
      hasAccess,
      // Deep-link the student to the academy contact for paid enrollment.
      enrollContactUrl: ENROLL_CONTACT,
      masters: course.teachers
        .filter((teacher) => teacher.name)
        .map((teacher) => ({
          id: teacher.id,
          name: teacher.name,
          profileUrl: teacher.profileUrl ?? null,
        })),
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        isFree: chapter.isFree,
        isLocked: !chapter.isFree && !hasAccess,
      })),
      chapterCount: course.chapters.length,
    });

    return addCorsHeaders(response, req);
  } catch (error) {
    console.log("[MOBILE_COURSE_DETAIL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
