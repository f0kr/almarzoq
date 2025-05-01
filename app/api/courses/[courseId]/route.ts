import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(req:Request, {
    params
}: Readonly<{
  params: Promise<{ courseId: string }>

}>) {
    try{
      const {userId} = await auth()
      const {courseId} = await params
      const values = await req.json()

      if(!userId) return new NextResponse("Unauthorized", { status: 401 })

        const course = await db.course.update({
            where: {
                id: courseId,
                userId
            },
             data: {
                 ...values
             }
        })
                return NextResponse.json(course, { status: 201 })
        
    }catch (error) {
     console.log("[COURSES]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}