import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
    req: Request
) {
    try {
        const {userId} = await auth()
        const {categoryName} = await req.json()

        if (!isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const attachments = await db.category.create({
            data: {
                name: categoryName,
            }
        })


        return NextResponse.json(attachments, { status: 201 });

    }catch (error) {
        console.log("CATEGORY_CREATE", error)
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}