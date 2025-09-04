"use client"

import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { SearchInput } from "./SearchInput"
import { isTeacher } from "@/lib/teacher"

export default function NavBarRoutes() {
   
    const {userId} = useAuth()
    const {isSignedIn, isLoaded} = useUser()
    const pathname = usePathname()
    

    const isTeacherPage = pathname?.startsWith("/teacher")
    const isCoursePage = pathname?.includes("/courses")
    const isSearchPage = pathname === "/"

    return(
      <>
      {isSearchPage && (
        <div className="hidden md:block">
            <SearchInput/>
        </div>
      )}
        <div className="flex gap-x-2 ml-auto">
            {isTeacherPage || isCoursePage ? (
                <Link href="/">
                <Button size="sm" variant="ghost">
                    <LogOut className="h-4 w-4 mr-2" />
                    Exit
                </Button>
                </Link>
            ): isTeacher(userId) ? (
                <Link href="/teacher/courses">
                <Button size="sm" variant="ghost">
                    Teacher mode
                </Button>
                </Link>
            ) : null}
            {!isSignedIn? (
            <SignInButton>
             <button className="px-4 py-2 bg-blue-600 text-white rounded">
                Sign In
             </button>
            </SignInButton>
            ): (
                <UserButton/>
            )}
        </div>
      </>
    )
}