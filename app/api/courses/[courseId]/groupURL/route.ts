import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isTeacher } from "@/lib/teacher";

export async function POST(
  req: Request,
  { params }: Readonly<{ params: Promise<{ courseId: string }> }>
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;
    const { name, url } = await req.json();

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!url) {
      return new NextResponse("Missing URL", { status: 400 });
    }

    // Ensure course belongs to the teacher
    const course = await db.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Create URL entry
    const groupUrl = await db.groupUrl.create({
      data: {
        name,
        url,
        courseId,
      },
    });

    return NextResponse.json(groupUrl);
  } catch (error) {
    console.log("[GROUP_URLS_PUT]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

