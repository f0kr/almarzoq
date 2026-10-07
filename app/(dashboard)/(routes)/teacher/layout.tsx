import type { Metadata } from "next"
import { isTeacher } from "@/lib/teacher"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

// Admin surface — nothing here should ever reach an index.
export const metadata: Metadata = {
    robots: { index: false, follow: false },
}

const TeacherLayout = async ({
    children
}: {
    children: React.ReactNode
})=> {

    const {userId} = await auth()

    if(!isTeacher(userId)) {
        return redirect("/")
    }

    return <>{children}</>
}

export default TeacherLayout