import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string; attachmentId: string }> }
) {
    try {
        const {userId} = await auth()
        const { courseId, attachmentId } = await params;

        if(!userId) {
            return new NextResponse("Unauthorized", {
                status: 401
            })
        }

        const courseOwner = await db.course.findFirst({
            where: {
                id: courseId,
                userId: userId
            }
        })

        if (!courseOwner) {
            return new NextResponse("Unauthorized", {
                status: 401
            })
        }

        const attachment = await db.attachment.delete({
            where: {
                id: attachmentId,
                courseId: courseId
            }
        })

        return NextResponse.json(attachment, {
            status: 200
        })

    } catch (error) {
        console.error('Error deleting attachment:', error)
        return new NextResponse("Internal Server Error", {
            status: 500
        })
    }
}