import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ masterId: string}> }
) {
    try {
        const {userId} = await auth()
        const { masterId } = await params;

        const utapi = new UTApi();

        function extractKeyFromUploadThingUrl(url: string): string | null {
            if (!url) return null;
            const parts = url.split('/');
            return parts[parts.length - 1] || null;
        }

        if(!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", {
                status: 401
            })
        }

        const teacher = await db.teacher.delete({
            where: {
                id: masterId
            }
        })

        if (teacher.profileUrl) {
            const key = extractKeyFromUploadThingUrl(teacher.profileUrl);
            if (key) await utapi.deleteFiles(key);
        }

        return NextResponse.json(teacher, {
            status: 200
        })

    } catch (error) {
        console.error('Error deleting master:', error)
        return new NextResponse("Internal Server Error", {
            status: 500
        })
    }
}

export async function PATCH(req:Request, {
    params
}: Readonly<{
  params: Promise<{ masterId: string }>

}>) {
    try{
      const {userId} = await auth()
      const {masterId} = await params
      const values = await req.json()

      if(!userId || !isTeacher(userId)) return new NextResponse("Unauthorized", { status: 401 })

        const teacher = await db.teacher.update({
            where: {
                id: masterId,
            },
             data: {
                 ...values
             }
        })
        return NextResponse.json(teacher)

    }catch (error) {
     console.log("[MASTERS]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}