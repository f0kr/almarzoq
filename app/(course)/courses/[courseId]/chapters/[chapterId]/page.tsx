import { getChapter } from "@/actions/getChapter";
import { Banner } from "@/components/Banner";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { VideoPlayer } from "./_components/VideoPlayer";
import { CourseEnrollButton } from "./_components/CourseEnrollButton";
import { Preview } from "@/components/Preview";
import { Separator } from "@/components/ui/separator";
import { File } from "lucide-react";
import { CourseProgressButton } from "./_components/CourseProgressButton";

export default async function ChapterId({
    params
}: {
    params: Promise<{courseId: string; chapterId: string}>
}){

    const {userId} = await auth()
    if(!userId) return redirect("/")

    const {chapterId, courseId}= await params

    const {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
    } = await getChapter({
        userId,
        chapterId,
        courseId,
    })

    if(!chapter || !course) return redirect("/")

    const isLocked = !chapter.isFree && !purchase
    const completeOnEnd = !!purchase && !userProgress?.isCompleted

    return(
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
            <div className="flex flex-col max-w-4xl mx-auto pb-20">
                <div className="p-4">
                    <VideoPlayer
                    chapterId={chapterId}
                    courseId={courseId}
                    title={chapter.title}
                    nextChapterId={nextChapter?.id}
                    playbackId={muxData?.playbackId!}
                    isLocked={isLocked}
                    completeOnEnd={completeOnEnd}
                    />
                </div>
                <div>
                    <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                      <h2 className="text-2xl font-semibod mb-2">
                        {chapter.title}
                      </h2>
                      {purchase ? (
                        <CourseProgressButton
                        chapterId={chapterId}
                        courseId={courseId}
                        nextChapterId={nextChapter?.id}
                        isCompleted={!!userProgress?.isCompleted}
                        />
                      ) : (
                        <CourseEnrollButton
                        courseId={courseId}
                        price={course.price!}
                        />
                      )}
                    </div>
                    <Separator/>
                    <div>
                        <Preview value={chapter.description!}/>
                    </div>
                    {!!attachments.length && (
                        <>
                          <Separator/>
                          <div className="p-4">
                            {attachments.map((attachment)=> (
                                <a key={attachment.id} target="_blanck" href={attachment.url}
                                className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                                >
                                  <File
                                  />
                                  <p className="line-clamp-1">
                                    {attachment.name}
                                  </p>
                                </a>

                            ))}
                          </div>
                        </>
                    )}
                    <Separator/>
                    {course.whatsappUrl && (
                      <div className="p-4 flex items-center">
                      <a
                        href={course.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors font-medium underline"
                      >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path d="M12.004 2.003c-5.522 0-9.997 4.475-9.997 9.997 0 1.762.463 3.484 1.343 4.997l-1.409 5.151a1 1 0 0 0 1.225 1.225l5.151-1.409a9.96 9.96 0 0 0 4.997 1.343c5.522 0 9.997-4.475 9.997-9.997s-4.475-9.997-9.997-9.997zm0 18.001a7.96 7.96 0 0 1-4.09-1.166l-.292-.174-3.057.837.837-3.057-.174-.292a7.96 7.96 0 0 1-1.166-4.09c0-4.411 3.586-7.997 7.997-7.997s7.997 3.586 7.997 7.997-3.586 7.997-7.997 7.997zm4.396-6.197c-.24-.12-1.417-.698-1.637-.778-.22-.08-.38-.12-.54.12-.16.24-.62.778-.76.938-.14.16-.28.18-.52.06-.24-.12-1.017-.375-1.94-1.194-.717-.639-1.203-1.428-1.344-1.668-.14-.24-.015-.37.105-.49.108-.107.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.297-.74-1.78-.2-.48-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.28-.22.22-.84.82-.84 2.01 0 1.19.86 2.34.98 2.5.12.16 1.7 2.6 4.13 3.54.58.2 1.03.32 1.38.41.58.15 1.1.13 1.51.08.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"/>
                        </svg>
                        WhatsApp group for the course
                      </a>
                      </div>
                    )}
                </div>
            </div>
        </div>
    )
}