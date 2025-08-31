import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ categoryId: string}> }
) {
    try {
        const {userId} = await auth()
        const { categoryId } = await params;

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