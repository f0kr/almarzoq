import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isTeacher } from "@/lib/teacher";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupUrlId: string }> }
) {
  try {
    const { userId } = await auth();
    const { groupUrlId } = await params;

    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new NextResponse("Missing targetUserId", { status: 400 });
    }

    const group = await db.groupUrl.findUnique({
      where: { id: groupUrlId},
    });

    if (!group) {
      return new NextResponse("Group not found", { status: 404 });
    }

    // Push userId if not already included
    const updated = await db.groupUrl.update({
      where: { id: groupUrlId },
      data: {
        studentIds: {
          push: targetUserId,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("[GROUPURL_ADD_USER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
