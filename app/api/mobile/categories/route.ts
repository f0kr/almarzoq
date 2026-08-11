import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get("origin") || undefined);
}

export async function GET(req: NextRequest) {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        iconUrl: true,
        // Count only published courses — mirrors the public web listing.
        courses: {
          where: { isPublished: true },
          select: { id: true },
        },
      },
    });

    const response = NextResponse.json({
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        iconUrl: category.iconUrl ?? null,
        courseCount: category.courses.length,
      })),
    });

    return addCorsHeaders(response, req);
  } catch (error) {
    console.log("[MOBILE_CATEGORIES]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
