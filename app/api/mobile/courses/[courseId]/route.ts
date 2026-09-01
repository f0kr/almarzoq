import { NextResponse } from "next/server";

import { getCourseDuration } from "@/actions/getCourseDuration";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usdToIqd } from "@/lib/fib-payments";

/** Where a student without card access can still reach a human. */
const ENROLL_CONTACT = "https://ig.me/m/almrzoq.academy";

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
          select: { id: true, name: true, profileUrl: true },
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

    const isFree = !course.price || course.price <= 0;
    const hasPurchase = course.purchases.length > 0;
    // Free courses are open to anyone signed in; paid ones need a purchase.
    const hasAccess = isFree ? !!userId : hasPurchase;

    return NextResponse.json({
      id: course.id,
      title: course.title,
      imageUrl: course.imageUrl ?? "",
      description: course.description ?? null,
      category: course.category?.name ?? null,
      price: course.price ?? null,
      /** What FIB will actually charge — whole IQD. */
      priceIqd: isFree ? null : usdToIqd(course.price!),
      isFree,
      hasAccess,
      enrollContactUrl: ENROLL_CONTACT,
      duration: await getCourseDuration(course.id),
      masters: course.teachers.map((teacher) => ({
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
  } catch (error) {
    console.log("[MOBILE_COURSE_DETAIL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
