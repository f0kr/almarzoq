import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{courseId: string; chapterId: string}>}
){
    try{
        const {userId} = await auth()
        const {courseId, chapterId} = await params

        if(!userId){
            return new NextResponse("Unathurized", {status:401})
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId
            }
        })

        if(!ownCourse){
            return new NextResponse("Unathurized", {status:401})
        }

        const chapter = await db.chapter.findUnique({
            where: {
                id: chapterId,
                courseId
            }
        })

        const muxData = await db.muxData.findUnique({
            where: {
                chapterId
            }
        })

        if(!chapter || /* !muxData || */ !chapter.title || !chapter.description || !chapter.videoUrl) {
            return new NextResponse("Missing required fields", {status: 400})
        }

        const publishedChapter = await db.chapter.update({
            where: {
                id: chapterId,
                courseId
            },
            data: {
                isPublished: true
            }
        })

        return NextResponse.json(publishedChapter)

    }catch(error){
        console.log("CHAPTER PUBLISH", error)
        return new NextResponse("Internal Error", {status:500})
    }
}