import { db } from "@/lib/db"
import { redirect } from "next/navigation"


export default async function CourseId({
    params
}: {
    params  : Promise<{courseId: string}>
}) {

    const {courseId} = await params

    const course = await db.course.findUnique({
        where: {
            id: courseId
        },
        include: {
            lectures: {
                where: {
                    chapters: {
                        some: {
                            isPublished: true
                        }
                    }
                },
                include: {
                    chapters: {
                        where: {
                            isPublished: true
                        },
                        orderBy: {
                        position: "asc"
                     }
                    }
                },
                orderBy: {
                    position: "asc"
                }
            }
        }
    })


    if(!course) return redirect("/")

    const firstChapter = course.lectures[0]?.chapters[0]

    if(!firstChapter) return redirect("/")

    return redirect(`/courses/${course.id}/chapters/${firstChapter.id}`)
}