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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ masterId: string }> }
) {
  try {
    const { masterId } = await params;

    const master = await db.teacher.findFirst({
      where: { id: masterId, isPublished: true },
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
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            price: true,
            createdAt: true,
            category: { select: { name: true } },
            chapters: { where: { isPublished: true }, select: { id: true } },
            teachers: { select: { name: true, profileUrl: true } },
            purchases: { select: { userId: true } },
          },
        },
      },
    });

    if (!master) {
      const notFound = NextResponse.json({ error: "Not found" }, { status: 404 });
      return addCorsHeaders(notFound, req);
    }

    const studentIds = new Set<string>();
    master.courses.forEach((course) =>
      course.purchases.forEach((purchase) => studentIds.add(purchase.userId))
    );

    const response = NextResponse.json({
      id: master.id,
      name: master.name,
      title: master.title ?? null,
      bio: plainText(master.bio),
      profileUrl: master.profileUrl ?? null,
      coverUrl: master.coverUrl ?? null,
      socialLinks: master.socialLinks,
      courseCount: master.courses.length,
      studentCount: studentIds.size,
      courses: master.courses.map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description ?? null,
        imageUrl: course.imageUrl ?? null,
        price: course.price ?? null,
        createdAt: course.createdAt.toISOString(),
        category: course.category?.name ?? null,
        chaptersLength: course.chapters.length,
        progress: null,
        masters: (course.teachers ?? [])
          .filter((teacher) => teacher.name)
          .map((teacher) => ({
            name: teacher.name,
            profileUrl: teacher.profileUrl ?? null,
          })),
      })),
    });

    return addCorsHeaders(response, req);
  } catch (error) {
    console.log("[MOBILE_MASTER_DETAIL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
