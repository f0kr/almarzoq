import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function getStudentCourses(studentId: string) {

    const {userId} = await auth()
    
        
     if(!isTeacher(userId)) return redirect("/")

        const purchases = await db.purchase.findMany({
            where: {
             userId: studentId
            }
        })

        const courseIds = purchases.map((purchase) => purchase.courseId)

        const courses = await db.course.findMany({
            where: {
            id: {
                notIn: courseIds
            }
            },
            include: {
                teachers: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return courses

}
