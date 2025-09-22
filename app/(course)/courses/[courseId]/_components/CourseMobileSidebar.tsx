"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Chapter, Course, Purchase, UserProgress } from "@prisma/client"
import { Menu } from "lucide-react"
import CourseSidebar from "./CourseSidebar"
import { useState } from "react"

interface CourseMobileSidebarProps {
    course: Course & {
        chapters: (Chapter & {
            userProgress: UserProgress[] | null
        })[]
    }
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
    <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <Menu/>
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