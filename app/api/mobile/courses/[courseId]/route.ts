import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
      },
      include: {
        category: true,
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: { id: true, title: true, isFree: true },
        },
        teachers: {
          select: { name: true },
        },
        purchases: {
          where: { userId: userId || "" },
          select: { id: true },
        },
      },
    });

    if (!course) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const hasPurchase = course.purchases.length > 0;

    return NextResponse.json({
      id: course.id,
      title: course.title,
      imageUrl: course.imageUrl ?? "",
      description: course.description ?? null,
      category: course.category?.name ?? null,
      masters: course.teachers.map((teacher) => teacher.name),
      chapters: course.chapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        isLocked: !chapter.isFree && !hasPurchase,
      })),
    });
  } catch (error) {
    console.log("[MOBILE_COURSE_DETAIL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
