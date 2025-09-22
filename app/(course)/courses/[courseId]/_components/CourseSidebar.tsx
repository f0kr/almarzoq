import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { Chapter, Course, Purchase, UserProgress } from "@prisma/client"
import CourseSidebarItem from "./CourseSidebarItem"
import { CourseProgress } from "@/components/CourseProgress"

interface CourseSidebarProps {
    course: Course & {
      chapters: (Chapter & {
        userProgress: UserProgress[] | null
      })[]
  }
  progressCount: number
  purchase: Purchase | null
  onChapterClick?: () => void
}

export default function CourseSidebar({
    course,
    progressCount,
    purchase,
    onChapterClick
}: CourseSidebarProps) {

    return(
        <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
          <div className="p-8 flex flex-col border-b">
            <h1 className="font-semibold">
                {course.title}
            </h1>
            {purchase && course.price === 0 && (
              <div className="mt-10">
                <CourseProgress
                variant='success'
                value={progressCount}
                />
              </div>
            )}
            {!purchase && course.price === 0 && (
              <div className="mt-10">
                <CourseProgress
                variant='success'
                value={progressCount}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col w-full">
            {course.chapters.map((chapter)=> (
                <CourseSidebarItem
                key={chapter.id}
                id={chapter.id}
                label={chapter.title}
                isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
                courseId={course.id}
                isLocked={!chapter.isFree && !purchase}
                onClick={onChapterClick}
                />
            ))}
          </div>
        </div>
    )
}
