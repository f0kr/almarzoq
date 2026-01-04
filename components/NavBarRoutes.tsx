"use client"

import { SignInButton, useAuth, UserButton, useUser } from "@clerk/nextjs"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./ui/button"
import { SearchInput } from "./SearchInput"
import { isTeacher } from "@/lib/teacher"
import { FaSignInAlt } from "react-icons/fa"
import localFont from "next/font/local"

const snellFont = localFont({
  src: [
    {
      path: '../public/fonts/snellroundhand_black.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/snellroundhand_bold.otf',
      weight: '700',
      style: 'bold',
    },
  ],
})

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
            <div className={`flex text-lg md:hidden lg:hidden ${snellFont.className}`}>
            <div className='text-center flex w-full'>Al<h1 className='text-yellow-500'>mrzoq </h1></div>
            <p>Academy</p>
            </div>
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

             <button className="px-3 py-1 bg-gradient-to-br to-[#282828] from-[#282828a9] rounded-sm text-[#cbab3e] shadow-lg shadow-black-800">
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