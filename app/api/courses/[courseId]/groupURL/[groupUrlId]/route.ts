import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isTeacher } from "@/lib/teacher";

export async function DELETE(
  req: Request,
  { params }: Readonly<{ params: Promise<{ courseId: string; groupUrlId: string }> }>
) {
  try {
    const { userId } = await auth();
    const { courseId, groupUrlId } = await params;

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the course exists + belongs to the teacher
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Check the URL item exists and belongs to this course
    const existing = await db.groupUrl.findUnique({
      where: { id: groupUrlId },
    });

    if (!existing || existing.courseId !== courseId) {
      return new NextResponse("Group URL not found", { status: 404 });
    }

    // Delete
    const deleted = await db.groupUrl.delete({
      where: { id: groupUrlId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[GROUP_URLS_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
