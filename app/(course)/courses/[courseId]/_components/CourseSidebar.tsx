"use client"

import { Chapter, Course, Lecture, Purchase, UserProgress } from "@prisma/client"
import CourseSidebarItem from "./CourseSidebarItem"
import { CourseProgress } from "@/components/CourseProgress"
import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

interface CourseSidebarProps {
  course: Course & {
    lectures: (Lecture & {
      chapters: (Chapter & {
        userProgress: UserProgress[]
      })[]
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
  onChapterClick,
}: CourseSidebarProps) {

  const pathname = usePathname()
  const chapterId = pathname?.split("/").pop()

  const [openLectureId, setOpenLectureId] = useState<string | null>(null)

  useEffect(()=> {
    if(!chapterId) return
    const lectureWithChapter = course.lectures.find(lecture => 
      lecture.chapters.some(chapter => chapter.id === chapterId)
    )

    if(lectureWithChapter) setOpenLectureId(lectureWithChapter.id)

  },[pathname])

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-5 flex flex-col gap-3 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif font-semibold text-xl">Course content</h2>
          <span className="text-xs text-muted-foreground line-clamp-1">{course.title}</span>
        </div>
        {course.price === 0 && (
          <CourseProgress
            variant='success'
            value={progressCount}
          />
        )}
      </div>

      <div className="flex flex-col w-full p-3">
        <Accordion.Root
          type="single"
          value={openLectureId || undefined}
          onValueChange={(value) => setOpenLectureId(value)}
          collapsible
          className="w-full space-y-2"
        >
          {course.lectures.map((lecture) => (
            <Accordion.Item
              key={lecture.id}

              value={lecture.id}
              className="border rounded-xl overflow-hidden"
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className={cn(
                    "w-full flex justify-between items-center px-4 py-3 font-medium text-left bg-muted hover:bg-muted transition",
                    "data-[state=open]:bg-muted"
                  )}
                >
                  <span>{lecture.title}</span>
                  <ChevronDown
                    className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content
                className="px-4 py-2 data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
              >
                <div className="flex flex-col gap-1">
                  {lecture.chapters.length > 0 ? (
                    lecture.chapters.map((chapter) => (
                      <CourseSidebarItem
                        key={chapter.id}
                        id={chapter.id}
                        label={chapter.title}
                        isCompleted={!!chapter.userProgress[0]?.isCompleted}
                        courseId={course.id}
                        isLocked={!chapter.isFree && !purchase}
                        onClick={onChapterClick}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic px-2">
                      No chapters yet
                    </p>
                  )}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  )
}

