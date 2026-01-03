"use client"

import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { SearchInput } from "./SearchInput"
import { isTeacher } from "@/lib/teacher"
import { FaSignInAlt } from "react-icons/fa"

export default function NavBarRoutes() {
   
    const {userId} = useAuth()
    const {isSignedIn, isLoaded} = useUser()
    const pathname = usePathname()

    if(!isLoaded) return null
    

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
                  <p className='ld:hidden md:hidden text-center font-bold w-full text-shadow-xs shadow-red-800'>Almrzoq Academy</p>

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
             <button>
                <FaSignInAlt/>
             </button>
            </SignInButton>
            ): (
                <UserButton/>
            )}
        </div>      
        </>
    )
}