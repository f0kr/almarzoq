import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

    const { userId } = await auth()
    const values = await req.json()
    try{
        
     if(!userId || !isTeacher(userId)) return new NextResponse("Unauthorized", { status: 401 })
        const teacher = await db.teacher.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(teacher, { status: 201 })

    }catch(error){

        console.log("[MASTER]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}