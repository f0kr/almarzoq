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
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import toast from "react-hot-toast";
import { SignIn, SignInButton } from "@clerk/nextjs";
import { getGroups } from "@/actions/getGroups";

export default async function ChapterId({
    params
}: {
    params: Promise<{courseId: string; chapterId: string}>
}){

    const {userId} = await auth()

    const {chapterId, courseId}= await params

    const {
        chapter,
        course,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
        isCourseFree
    } = await getChapter({
        userId: userId || "",
        chapterId,
        courseId,
    })

    if(!chapter || !course) return redirect("/")

    const isLocked = !chapter.isFree && !purchase
    const completeOnEnd = !userProgress?.isCompleted

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
                    lectureId={chapter.lectureId!}
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
                      {purchase && userId ? (
                        <CourseProgressButton
                        chapterId={chapterId}
                        lectureId={chapter.lectureId!}
                        courseId={courseId}
                        nextChapterId={nextChapter?.id}
                        isCompleted={!!userProgress?.isCompleted}
                        />
                      ) : (
                        !userId && !isCourseFree ? (
                         <p className=  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
                                Please{" "}
                          <SignInButton forceRedirectUrl={`/courses/${courseId}/chapters/${chapterId}`} mode="modal">
                           <button className="font-bold underline hover:text-primary transition">
                            sign in
                           </button>  
                          </SignInButton>{" "}
                            to enroll for {formatPrice(course.price!)}
                          </p>
                        ) : ( !isCourseFree && userId ?
                          (
                        <a target="_blank" href="https://t.me/AlmrzoqAcademy">
                        <Button
                        size="sm"
                        className="w-full md:w-auto"
                         >
                        Contact Us and Enroll for {formatPrice(course.price!)}
                        </Button>
                        </a>
                        ) : isCourseFree && !userId ? (
                          <p className=  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive">
                            Please{" "}
                           <SignInButton mode="modal">
                           <button className="font-bold underline hover:text-primary transition">
                            sign in
                           </button>  
                          </SignInButton>{" "}
                          to track progress
                          </p>
                        ): (
                        <CourseProgressButton
                        chapterId={chapterId}
                        lectureId={chapter.lectureId!}
                        courseId={courseId}
                        nextChapterId={nextChapter?.id}
                        isCompleted={!!userProgress?.isCompleted}
                        />
                        )
                      )
/*                         <CourseEnrollButton
                        courseId={courseId}
                        price={course.price!}
                        /> */
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
                    {course.groupUrls && purchase && course.groupUrls.find((g)=> g.studentIds.includes(userId!)) && (
                      <div className="p-4 flex items-center">
                      <a
                      href={course.groupUrls?.find((g)=> g.studentIds.includes(userId!))?.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors font-medium underline"
                      
                      >
                      <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      >
                        <path d="M9.036 15.956l-.396 4.01c.568 0 .814-.244 1.112-.537l2.664-2.523 5.522 4.027c1.012.557 1.73.264 1.98-.937l3.594-16.84c.328-1.523-.553-2.12-1.53-1.78L2.22 9.36c-1.48.553-1.464 1.34-.254 1.697l4.09 1.28 9.5-5.99c.447-.273.855-.122.52.174"/>
                      </svg>
                        {course.groupUrls?.find((g)=> g.studentIds.includes(userId!))?.name}
                      </a>
                      </div>
                    )}
                </div>
            </div>
        </div>
    )
}