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
    onClick?: () => void
}

export default function CourseSidebarItem({
    label,
    id,
    isCompleted,
    courseId,
    isLocked,
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
            "flex items-center gap-x-2 text-black text-sm font-[500] pl-6 transition-all",
        )}
        >
            <div className="flex items-center gap-x-2">
                <Icon
                size={22}
                className={cn(
                    "text-black/60",
                    isActive && "text-black",
                    isCompleted && "text-black"
                )}
                />
                <span className="ml-2">{label}</span>
            </div>
            <div className={cn(
                "ml-auto opacity-0 border-2 border-black/40 h-[40px] transition-all",
                isActive && "opacity-100",
                isCompleted && "border-black"
            )}/>
        </button>
    )
}