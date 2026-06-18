import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ categoryId: string}> }
) {
    try {
        const {userId} = await auth()
        const { categoryId } = await params;

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

        const category = await db.category.delete({
            where: {
                id: categoryId
            }
        })

        if(category.iconUrl){
            const key = extractKeyFromUploadThingUrl(category.iconUrl);
            if (key) await utapi.deleteFiles(key);
        }

        return NextResponse.json(category, {
            status: 200
        })

    } catch (error) {
        console.error('Error deleting category:', error)
        return new NextResponse("Internal Server Error", {
            status: 500
        })
    }
}

export async function PATCH(req:Request, {
    params
}: Readonly<{
  params: Promise<{ categoryId: string }>

}>) {
    try{
      const {userId} = await auth()
      const {categoryId} = await params
      const values = await req.json()

      if(!userId || !isTeacher(userId)) return new NextResponse("Unauthorized", { status: 401 })

        const category = await db.category.update({
            where: {
                id: categoryId,
            },
             data: {
                 ...values
             }
        })
        return NextResponse.json(category)

    }catch (error) {
     console.log("[CATEGORY]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}