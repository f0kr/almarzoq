import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get('origin') || undefined);
}

export async function GET(req: NextRequest) {
  try{
    const courses = await db.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        price: true,
        createdAt: true,
      },
    })
    const response = NextResponse.json({ courses })

    return addCorsHeaders(response, req);
  }catch (error){
   console.log(error)}
   return new NextResponse("Internal server error", {status: 500})
}
