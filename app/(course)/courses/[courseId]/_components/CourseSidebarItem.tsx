"use client"

import { cn } from "@/lib/utils"
import { CheckCircle, Lock, PlayCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

interface CourseSidebarItemProps {
    label: string
    id: string
    isCompleted: boolean
    courseId: string
    isLocked: boolean
    /** Free chapter in a course the viewer hasn't bought — worth advertising.
        Once purchased everything is unlocked, so the badge is just noise. */
    isFreePreview: boolean
    onClick?: () => void
}

export default function CourseSidebarItem({
    label,
    id,
    isCompleted,
    courseId,
    isLocked,
    isFreePreview,
    onClick
}: CourseSidebarItemProps){

    const pathname = usePathname()
    const router = useRouter()
    const Icon = isLocked ? Lock : (isCompleted? CheckCircle : PlayCircle)
    const isActive = pathname?.includes(id)

    const handleClick = ()=> {
        router.push(`/courses/${courseId}/chapters/${id}`)
        if(onClick) onClick()
    }
    return(
        <button
        onClick={handleClick}
        type="button"
        className={cn(
            /* Atelier chapter states (course-player card): incomplete grey,
               completed sage, playing clay-tint on solid clay */
            "w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] text-grey transition hover:bg-paper",
            isCompleted && "text-sage",
            isActive && "bg-clay text-clay-tint font-semibold hover:bg-clay"
        )}
        >
            <Icon size={17} className="shrink-0" />
            <span className="truncate">{label}</span>
            {isFreePreview && (
                <span className="ml-auto shrink-0 rounded-full bg-clay-tint px-2 py-0.5 text-[11px] font-semibold text-clay">
                    Free
                </span>
            )}
        </button>
    )
}
