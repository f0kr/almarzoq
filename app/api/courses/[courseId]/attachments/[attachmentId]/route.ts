import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { courseId: string; attachmentId: string } }
) {
    try {
        const {userId} = await auth()

        if(!userId) {
            return new NextResponse("Unauthorized", {
                status: 401
            })
        }

        const courseOwner = await db.course.findFirst({
            where: {
                id: params.courseId,
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
                id: params.attachmentId,
                courseId: params.courseId
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