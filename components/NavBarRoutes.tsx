"use client"

import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { SearchInput } from "./SearchInput"
import { isTeacher } from "@/lib/teacher"
import { FaSignInAlt } from "react-icons/fa"
import { cn } from "@/lib/utils"

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
            <div className={cn(`flex text-lg md:hidden lg:hidden font-serif`,
                            isCoursePage && 'hidden'
            )}>
            <div className='text-center flex w-full'>Al<h1 className='italic text-primary'>mrzoq </h1></div>
            <p>Academy</p>
            </div>
        <div className="flex gap-x-2 ml-auto justify-center items-center">
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

             <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold shadow-sm hover:bg-tan transition">
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