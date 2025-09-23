import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ chapterId: string; attachmentId: string }> }
) {
    try {
        const {userId} = await auth()
        const { chapterId, attachmentId } = await params
        const utapi = new UTApi()

        function extractKeyFromUploadThingUrl(url: string): string | null {
         if (!url) return null;
         const parts = url.split('/');
         return parts[parts.length - 1] || null;
    }

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

        if(attachment.url){
            const key = extractKeyFromUploadThingUrl(attachment.url);
            if (key) await utapi.deleteFiles(key);
        }

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