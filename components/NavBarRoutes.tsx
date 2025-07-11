"use client"

import { UserButton } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"

export default function NavBarRoutes() {

    const pathname = usePathname()

    const isTeacherPage = pathname?.startsWith("/teacher")
    const isPlayerPage = pathname?.includes("/chapter")

    return(
        <div className="flec gap-x-2 ml-auto">
            {isTeacherPage || isPlayerPage ? (
                <Link href="/">
                <Button>
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit
                </Button>
                </Link>
            ): (
                <Link href="/teacher/courses">
                <Button size="sm" variant="ghost">
                    Teacher mode
                </Button>
                </Link>
            )}
            <UserButton />
        </div>
    )
}