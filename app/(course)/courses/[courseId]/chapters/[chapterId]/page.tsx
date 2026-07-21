import { getChapter } from "@/actions/getChapter";
import { Banner } from "@/components/Banner";
import { IconBadge } from "@/components/IconBadge";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/VideoPlayer";
import { ChapterLoadingProvider } from "./_components/ChapterLoadingProvider";
import { Preview } from "@/components/Preview";
import { Download, File, Users } from "lucide-react";
import { CourseProgressButton } from "./_components/CourseProgressButton";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { SignInButton } from "@/components/auth/SignInButton";

const TelegramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M9.036 15.956l-.396 4.01c.568 0 .814-.244 1.112-.537l2.664-2.523 5.522 4.027c1.012.557 1.73.264 1.98-.937l3.594-16.84c.328-1.523-.553-2.12-1.53-1.78L2.22 9.36c-1.48.553-1.464 1.34-.254 1.697l4.09 1.28 9.5-5.99c.447-.273.855-.122.52.174" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const getGroupIcon = (url: string) => {
  if (url.includes("t.me")) return <TelegramIcon />;
  if (url.includes("chat.whatsapp.com")) return <WhatsAppIcon />;
  return <Users className="h-[18px] w-[18px]" />;
};

export default async function ChapterId({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { userId } = await auth();

  const { chapterId, courseId } = await params;

  const {
    chapter,
    course,
    muxData,
    attachments,
    nextChapter,
    userProgress,
    purchase,
    isCourseFree,
  } = await getChapter({
    userId: userId || "",
    chapterId,
    courseId,
  });

  if (!chapter || !course) return redirect("/");

  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !userProgress?.isCompleted;

  const group = course.groupUrls?.find((g) => g.studentIds.includes(userId!));
  const showGroup = !!(course.groupUrls && purchase && group);

  return (
    // keyed so the loading state restarts when navigating between chapters
    <ChapterLoadingProvider key={chapterId}>
    <div>
      {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="You've already completed this chapter"
        />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="You need to purchase this course to watch this chapter"
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto px-4 pb-20 gap-4">
        <div className="pt-4">
          <VideoPlayer
            chapterId={chapterId}
            courseId={courseId}
            lectureId={chapter.lectureId!}
            title={chapter.title}
            nextChapterId={nextChapter?.id}
            playbackId={muxData?.playbackId!}
            isLocked={isLocked}
            completeOnEnd={completeOnEnd}
            canTrackProgress={!!userId}
          />
        </div>

        <div className="rounded-2xl border border-beige bg-card p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold">{chapter.title}</h2>
            {purchase && userId ? (
              <CourseProgressButton
                chapterId={chapterId}
                lectureId={chapter.lectureId!}
                courseId={courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : !userId && !isCourseFree ? (
              <p className="text-sm text-grey">
                Please{" "}
                <SignInButton
                  forceRedirectUrl={`/courses/${courseId}/chapters/${chapterId}`}
                  mode="modal"
                >
                  <button className="font-semibold text-clay hover:underline">
                    sign in
                  </button>
                </SignInButton>{" "}
                to enroll for {formatPrice(course.price!)}
              </p>
            ) : !isCourseFree && userId ? (
              <a target="_blank" href="https://t.me/AlmrzoqAcademy" rel="noopener noreferrer">
                <Button size="sm" className="w-full md:w-auto">
                  Contact Us and Enroll for {formatPrice(course.price!)}
                </Button>
              </a>
            ) : isCourseFree && !userId ? (
              <p className="text-sm text-grey">
                Please{" "}
                <SignInButton mode="modal">
                  <button className="font-semibold text-clay hover:underline">
                    sign in
                  </button>
                </SignInButton>{" "}
                to track progress
              </p>
            ) : (
              <CourseProgressButton
                chapterId={chapterId}
                lectureId={chapter.lectureId!}
                courseId={courseId}
                nextChapterId={nextChapter?.id}
                isCompleted={!!userProgress?.isCompleted}
              />
            )}
          </div>

          {chapter.description && (
            <div className="mt-4 border-t border-beige pt-4 [&_.ql-editor]:p-0">
              <Preview value={chapter.description} />
            </div>
          )}
        </div>

        {!!attachments.length && (
          <div className="rounded-2xl border border-beige bg-card p-5">
            <h3 className="mb-3 font-serif text-lg font-semibold">Attachments</h3>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={attachment.url}
                  className="flex items-center gap-3 rounded-xl border border-beige bg-paper px-3.5 py-2.5 transition hover:border-tan hover:bg-clay-tint"
                >
                  <IconBadge icon={File} size="sm" />
                  <p className="line-clamp-1 flex-1 text-sm font-medium text-ink">
                    {attachment.name}
                  </p>
                  <Download className="h-4 w-4 shrink-0 text-grey" />
                </a>
              ))}
            </div>
          </div>
        )}

        {showGroup && (
          <div className="rounded-2xl border border-beige bg-card p-5">
            <h3 className="mb-3 font-serif text-lg font-semibold">Class group</h3>
            <a
              href={group!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-clay bg-card px-4 py-2 text-sm font-semibold text-clay shadow-sm transition hover:bg-paper"
            >
              {getGroupIcon(group!.url)}
              <span className="truncate">{group!.name}</span>
            </a>
          </div>
        )}
      </div>
    </div>
    </ChapterLoadingProvider>
  );
}
