import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

// Mux serves HLS from a stable URL keyed by the playback id. When a chapter has
// no Mux asset we fall back to the raw videoUrl (older uploads).
function playbackUrl(
  playbackId: string | null | undefined,
  videoUrl: string | null | undefined
): string | null {
  if (playbackId) return `https://stream.mux.com/${playbackId}.m3u8`;
  return videoUrl ?? null;
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request.headers.get("origin") || undefined);
}

/**
 * The mobile Player screen data: the requested chapter's playback source plus
 * the whole chapter list (with per-chapter lock/completion) for "Up next".
 * A single round-trip powers the entire screen.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId } = await params;

    const course = await db.course.findFirst({
      where: { id: courseId, isPublished: true },
      select: {
        id: true,
        title: true,
        price: true,
        purchases: {
          where: { userId: userId || "" },
          select: { id: true },
        },
        chapters: {
          where: { isPublished: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            isFree: true,
            videoUrl: true,
            muxData: { select: { playbackId: true, duration: true } },
            userProgress: {
              where: { userId: userId || "" },
              select: { isCompleted: true },
            },
          },
        },
      },
    });

    if (!course) {
      return addCorsHeaders(
        NextResponse.json({ error: "Not found" }, { status: 404 }),
        req
      );
    }

    const isFreeCourse = !course.price || course.price === 0;
    const hasAccess = isFreeCourse || course.purchases.length > 0;

    const index = course.chapters.findIndex((c) => c.id === chapterId);
    if (index === -1) {
      return addCorsHeaders(
        NextResponse.json({ error: "Chapter not found" }, { status: 404 }),
        req
      );
    }

    const current = course.chapters[index];
    const currentLocked = !current.isFree && !hasAccess;

    // Never leak a playback URL for a chapter the student can't access.
    const url = currentLocked
      ? null
      : playbackUrl(current.muxData?.playbackId, current.videoUrl);

    const chapters = course.chapters.map((c, i) => ({
      id: c.id,
      title: c.title,
      isFree: c.isFree,
      isLocked: !c.isFree && !hasAccess,
      isCompleted: c.userProgress[0]?.isCompleted ?? false,
      durationSeconds: c.muxData?.duration ?? null,
      position: i,
    }));

    const next = course.chapters
      .slice(index + 1)
      .find((c) => c.isFree || hasAccess);

    return addCorsHeaders(
      NextResponse.json({
        courseId: course.id,
        courseTitle: course.title,
        chapterId: current.id,
        title: current.title,
        isFree: current.isFree,
        isLocked: currentLocked,
        playbackUrl: url,
        isCompleted: current.userProgress[0]?.isCompleted ?? false,
        durationSeconds: current.muxData?.duration ?? null,
        position: index,
        chapterCount: course.chapters.length,
        nextChapterId: next?.id ?? null,
        chapters,
      }),
      req
    );
  } catch (error) {
    console.log("[MOBILE_CHAPTER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Toggle the student's completion state for a chapter. Mirrors the web
 * progress route but gated so locked chapters can't be marked.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId } = await params;

    if (!userId) {
      return addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        req
      );
    }

    const body = await req.json().catch(() => ({}));
    const isCompleted = Boolean(body?.isCompleted);

    // Confirm the chapter belongs to a published course the user can access.
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId, isPublished: true },
      select: {
        isFree: true,
        course: {
          select: {
            price: true,
            purchases: { where: { userId }, select: { id: true } },
          },
        },
      },
    });

    if (!chapter) {
      return addCorsHeaders(
        NextResponse.json({ error: "Chapter not found" }, { status: 404 }),
        req
      );
    }

    const isFreeCourse = !chapter.course.price || chapter.course.price === 0;
    const hasAccess = isFreeCourse || chapter.course.purchases.length > 0;
    if (!chapter.isFree && !hasAccess) {
      return addCorsHeaders(
        NextResponse.json({ error: "Chapter is locked" }, { status: 403 }),
        req
      );
    }

    const progress = await db.userProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      update: { isCompleted },
      create: { userId, chapterId, isCompleted },
    });

    return addCorsHeaders(
      NextResponse.json({ isCompleted: progress.isCompleted }),
      req
    );
  } catch (error) {
    console.log("[MOBILE_CHAPTER_PROGRESS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
