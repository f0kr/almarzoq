import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

    const { userId } = await auth()
    const {studentId, courseId} = await req.json()
    try{
        
     if(!userId || !isTeacher(userId)) return new NextResponse("Unauthorized", { status: 401 })
        const purchase = await db.purchase.create({
            data: {
                userId: studentId,
                courseId
            }
        })

        return NextResponse.json(purchase, { status: 201 })

    }catch(error){

        console.log("[STUDENT]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}