"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Chapter, Course, Lecture, Purchase, UserProgress } from "@prisma/client"
import { ListVideo, Menu } from "lucide-react"
import CourseSidebar from "./CourseSidebar"
import { useState } from "react"

interface CourseMobileSidebarProps {
  course: Course & {
    lectures: (Lecture & {
      chapters: (Chapter & {
        userProgress: UserProgress[];
      })[];
    })[];
  };
    purchase: Purchase | null
    progressCount: number
}

export default function CourseMobileSidebar({
    course,
    progressCount,
    purchase
}: CourseMobileSidebarProps){

    const [open, setOpen] = useState(false)

    return(
   <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger className="md:hidden px-3 py-2 hover:opacity-85 transition flex items-center mr-2 gap-2 bg-red-200/20 rounded-lg hover:bg-red-200/30">
        <ListVideo className="h-5 w-5 text-red-700" />
        <span className="font-medium text-red-700">Chapters</span>
    </SheetTrigger>
    <SheetContent side="left" className="p-0 bg-white w-72">
        <CourseSidebar
        course={course}
        progressCount={progressCount}
        purchase={purchase}
        onChapterClick={() => setOpen(false)}
        />
    </SheetContent>
   </Sheet>
   )
}