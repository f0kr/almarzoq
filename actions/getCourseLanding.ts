import { db } from "@/lib/db";

interface GetCourseLandingProps {
  courseId: string;
  userId?: string | null;
}

/**
 * Public course landing-page data. Only published courses with at least one
 * published chapter are returned; anything else yields null so the page can
 * render a 404 (better for SEO than redirecting).
 */
export async function getCourseLanding({
  courseId,
  userId,
}: GetCourseLandingProps) {
  const course = await db.course.findFirst({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      category: true,
      teachers: {
        where: { isPublished: true },
        select: { id: true, name: true, title: true, profileUrl: true },
      },
      lectures: {
        where: { chapters: { some: { isPublished: true } } },
        orderBy: { position: "asc" },
        include: {
          chapters: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true, title: true, isFree: true },
          },
        },
      },
    },
  });

  if (!course || course.lectures.length === 0) return null;

  const purchase = userId
    ? await db.purchase.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })
    : null;

  // Flat list preserves lecture then chapter ordering for "start/continue" CTAs.
  const orderedChapters = course.lectures.flatMap((lecture) =>
    lecture.chapters.map((chapter) => ({ ...chapter, lectureId: lecture.id })),
  );

  const chapterCount = orderedChapters.length;
  const freeChapterCount = orderedChapters.filter((c) => c.isFree).length;
  const firstChapter = orderedChapters[0] ?? null;

  return {
    course,
    purchase,
    firstChapter,
    chapterCount,
    freeChapterCount,
    lectureCount: course.lectures.length,
  };
}
