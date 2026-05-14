import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ courseId: string; lectureId: string }> }
) {
    try {
        const {userId} = await auth()
        const {title} = await req.json()
        const { courseId, lectureId } = await params;

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


        const lastChapter = await db.chapter.findFirst({
            where: {
                lectureId: lectureId
            },
            orderBy: {
                position: 'desc'
            }
        })

        const newPosition = lastChapter ? lastChapter.position + 1 : 1

        const chapter = await db.chapter.create({
            data: {
                title,
                courseId: courseId,
                position: newPosition,
                lectureId
            }
        })

        return NextResponse.json(chapter, { status: 201 })

    } catch (error){
        console.log("CHAPTERS", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}