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
  className?: string
}

export default function CourseSidebar({
  course,
  progressCount,
  purchase,
  onChapterClick,
  className,
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
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      <div className="px-5 py-[22px] flex flex-col gap-3.5 border-b border-border">
        <h1 className="font-serif font-semibold text-[19px] leading-tight">{course.title}</h1>
        {course.price === 0 && (
          <CourseProgress
            variant='success'
            size='sm'
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
          className="w-full space-y-2.5"
        >
          {course.lectures.map((lecture) => (
            <Accordion.Item
              key={lecture.id}

              value={lecture.id}
              className="border border-beige rounded-[14px] overflow-hidden bg-card"
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className={cn(
                    "w-full flex justify-between items-center gap-2 px-3.5 py-3 text-sm font-semibold text-left bg-paper hover:bg-paper transition",
                    "data-[state=open]:bg-clay-tint data-[state=open]:text-clay",
                    "[&[data-state=open]>svg]:rotate-180"
                  )}
                >
                  <span>{lecture.title}</span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform duration-200"
                    aria-hidden
                  />
                </Accordion.Trigger>
              </Accordion.Header>

              <Accordion.Content
                className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
              >
                <div className="flex flex-col">
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

