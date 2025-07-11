import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ courseId: string }> }
    ) {
        try {

            const {userId} = await auth()

            if(!userId) {
                return new NextResponse('Unauthorized', {
                    status: 401
                })
            }

            const {list} = await request.json()

            const ownCourse = await db.course.findUnique({
                where: {
                    id: (await params).courseId,
                    userId: userId
                }
            })

            if(!ownCourse) {
                return new NextResponse('Unauthorized', {
                    status: 401
                })
            }

            for (let item of list){
                await db.chapter.update({
                    where:{ id: item.id },
                    data: {position: item.position}
                })
            }

            return new NextResponse("Success", {status: 200})

        }catch (error) {
            console.log("REORDER",error)
            return new NextResponse('Something went wrong while reordering chapters.', {
                status: 500
            })
        }
    }
