import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{courseId: string}>}
){
    try{

        const {userId} = await auth()
        const {courseId} = await params

        if(!userId){
            return new NextResponse("Unauthorized", {status: 401})
        }

        const course = await db.course.findUnique({
            where: {
                id: courseId,
                userId
            }
        })

        if(!course){
            return new NextResponse("Not Found", {status: 404})
        }



        const unpublishedCourse = await db.course.update({
            where: {
                id: courseId,
                userId
            },
            data: {
                isPublished: false
            }
        })

        return NextResponse.json(unpublishedCourse)    

    }catch(error){
        console.log("COURSE_ID_UNPUBLISH", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}