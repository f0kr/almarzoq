import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node"
import { isTeacher } from "@/lib/teacher";
import { UTApi } from "uploadthing/server";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET
})
const video = mux.video

export async function DELETE(
    req: Request,
    {params}: {params: Promise<{courseId: string}>}

){

   try{
    
    const utapi = new UTApi();
    const {userId} = await auth()
    const {courseId} = await params

    if(!isTeacher(userId)){
        return new NextResponse("Unauthorized", {status: 401})
    }

    const course = await db.course.findUnique({
        where: {
           id: courseId,
           userId: userId || ""
        },
        include: {
            chapters: {
                include: {
                    muxData: true,
                    attachments: true
                }
            }
        }
    })

    if(!course){
        return new NextResponse("Not Found", {status: 404})
    }

for (const chapter of course.chapters){
    if(chapter.muxData?.assetId){
        await video.assets.delete(chapter.muxData.assetId)
    }

    if (chapter.videoUrl) {
        const key = extractKeyFromUploadThingUrl(chapter.videoUrl);
        if (key) await utapi.deleteFiles(key);
    }

    for (const attachment of chapter.attachments) {
        if(attachment.key) {
            await utapi.deleteFiles(attachment.key)
        }
    }
}

    if (course.imageUrl) {
        const key = course.imageUrl.split("/").pop(); 
          if (key) await utapi.deleteFiles(key);
    }

    function extractKeyFromUploadThingUrl(url: string): string | null {
     if (!url) return null;
     const parts = url.split('/');
     return parts[parts.length - 1] || null;
    }

    const deletedCourse = await db.course.delete({
        where: {
            id: courseId,
        }
    })

    return NextResponse.json(deletedCourse)

   }catch(error){
    console.log("COURSE_ID_DELETE")
    return new NextResponse("internal Error", {status: 500})
   }
}

export async function PATCH(req:Request, {
    params
}: Readonly<{
  params: Promise<{ courseId: string }>

}>) {
    try{
      const {userId} = await auth()
      const {courseId} = await params
      const values = await req.json()
      const { teacherIds, ...rest } = values

      if(!userId || !isTeacher(userId)) return new NextResponse("Unauthorized", { status: 401 })

        const data: any = {
            ...rest
        }

        if (Array.isArray(teacherIds)) {
            data.teachers = {
                set: teacherIds.map((id: string) => ({ id }))
            }
        }

        const course = await db.course.update({
            where: {
                id: courseId,
                userId
            },
             data
        })
        return NextResponse.json(course)

    }catch (error) {
     console.log("[COURSES]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
