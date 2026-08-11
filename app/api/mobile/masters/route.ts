import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

/**
 * Bios are stored as rich-text HTML for the web. The mobile client renders
 * plain text, so strip tags and collapse whitespace before returning.
 */
const plainText = (html: string | null): string | null => {
  if (!html) return null;
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text.length ? text : null;
};

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get("origin") || undefined);
}

export async function GET(req: NextRequest) {
  try {
    const masters = await db.teacher.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        title: true,
        bio: true,
        profileUrl: true,
        coverUrl: true,
        socialLinks: true,
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            purchases: { select: { userId: true } },
          },
        },
      },
    });

    const response = NextResponse.json({
      masters: masters.map((master) => {
        // Unique students across all of a master's published courses.
        const studentIds = new Set<string>();
        master.courses.forEach((course) =>
          course.purchases.forEach((purchase) => studentIds.add(purchase.userId))
        );

        return {
          id: master.id,
          name: master.name,
          title: master.title ?? null,
          bio: plainText(master.bio),
          profileUrl: master.profileUrl ?? null,
          coverUrl: master.coverUrl ?? null,
          socialLinks: master.socialLinks,
          courseCount: master.courses.length,
          studentCount: studentIds.size,
        };
      }),
    });

    return addCorsHeaders(response, req);
  } catch (error) {
    console.log("[MOBILE_MASTERS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
