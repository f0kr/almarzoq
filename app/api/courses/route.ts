import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {

    const { userId } = await auth()
    const {title} = await req.json()
    try{
        
     if(!userId) return new NextResponse("Unauthorized", { status: 401 })
        const course = await db.course.create({
            data: {
                title,
                userId
            }
        })

        return NextResponse.json(course, { status: 201 })

    }catch(error){

        console.log("[COURSES]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}