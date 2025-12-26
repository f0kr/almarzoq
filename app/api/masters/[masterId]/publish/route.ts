import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{masterId: string}>}
){
    try{

        const {userId} = await auth()
        const {masterId} = await params

        if(!userId){
            return new NextResponse("Unauthorized", {status: 401})
        }

        const master = await db.teacher.findUnique({
            where: {
                id: masterId,
            },
        })

        if(!master){
            return new NextResponse("Not Found", {status: 404})
        }

        if(!master.name || !master.title || !master.bio){
            return new NextResponse("Missing required fields", {status: 401})
        }

        const publishedMaster = await db.teacher.update({
            where: {
                id: masterId,
            },
            data: {
                isPublished: true
            }
        })

        return NextResponse.json(publishedMaster)    

    }catch(error){
        console.log("MASTER_ID_PUBLISH", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}