import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string; lectureId: string }> }
){
        const { courseId, lectureId } = await params
        
    try{
        const {userId} = await auth()
            
        if(!userId) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        
        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId
            }
        })

        
        if(!ownCourse) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const deletedLectures = await db.lecture.delete({
            where: {
                id: lectureId
            }
        })

        return NextResponse.json(deletedLectures)

    }catch (error){
        console.log("LECTURE_Id_Delete", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; lectureId: string }> }
){
    const { courseId, lectureId } = await params;

    try{
        const {userId} = await auth()
        const { title } = await req.json()

        if(!userId) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId
            }
        })

        if(!ownCourse) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const lecture = await db.lecture.update({
            where: {
                id: lectureId,
                courseId: courseId
            },
            data: {
                title
            }

        })


        return NextResponse.json(lecture, { status: 200 });

    }catch (error) {
        console.log("Error updating lecture:", error);
        return new NextResponse("internal server error", { status: 500 });
    }
}