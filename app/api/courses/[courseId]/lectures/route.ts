import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const {userId} = await auth()
        const {title} = await req.json()
        const { courseId } = await params;

        if (!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const courseOwner = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId
            }
        })

        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 })
        }


        const lastLecture = await db.lecture.findFirst({
            where: {
                courseId: courseId
            },
            orderBy: {
                position: 'desc'
            }
        })

        const newPosition = lastLecture ? lastLecture.position + 1 : 1

        const lecture = await db.lecture.create({
            data: {
                title,
                courseId: courseId,
                position: newPosition
            }
        })

        return NextResponse.json(lecture, { status: 201 })

    } catch (error){
        console.log("LECTURES", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}