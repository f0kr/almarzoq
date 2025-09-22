import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ chapterId: string; attachmentId: string }> }
) {
    try {
        const {userId} = await auth()
        const { chapterId, attachmentId } = await params;

        if(!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", {
                status: 401
            })
        }

        const attachment = await db.attachment.delete({
            where: {
                id: attachmentId,
                chapterId: chapterId
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