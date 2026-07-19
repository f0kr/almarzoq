import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    {params}: {params: Promise<{masterId: string}>}
){
    try{

        const {userId} = await auth()
        const {masterId} = await params

        if(!userId || !isTeacher(userId)){
            return new NextResponse("Unauthorized", {status: 401})
        }

        const master = await db.teacher.findUnique({
            where: {
                id: masterId,
            }
        })

        if(!master){
            return new NextResponse("Not Found", {status: 404})
        }



        const unpublishedMaster = await db.teacher.update({
            where: {
                id: masterId,
            },
            data: {
                isPublished: false
            }
        })

        return NextResponse.json(unpublishedMaster)    

    }catch(error){
        console.log("MASTER_ID_UNPUBLISH", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}