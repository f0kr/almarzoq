import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
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


        const unpublishedChapter = await db.chapter.update({
            where: {
                id: chapterId,
                courseId
            },
            data: {
                isPublished: false
            }
        })

        const puplishedChaptersInCourse = await db.chapter.findMany({
            where: {
                courseId,
                isPublished: true
            }
        })

        if(!puplishedChaptersInCourse.length){
            await db.course.update({
                where: {
                    id: courseId
                },
                data: {
                    isPublished: false
                }
            })
        }



        return NextResponse.json(unpublishedChapter)

    }catch(error){
        console.log("CHAPTER UNPUBLISH", error)
        return new NextResponse("Internal Error", {status:500})
    }
}