import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"


export default async function CourseId({
    params
}: {
    params  : Promise<{courseId: string}>
}) {

    const {courseId} = await params
    const {userId} = await auth()

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

    const purchase = userId
        ? await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: course.id
                }
            }
        })
        : null

    const chapters = course.lectures.flatMap((lecture) => lecture.chapters)

    if(chapters.length === 0) return redirect("/")

    // Without a purchase, chapter 1 is usually locked — open on the first
    // free chapter instead so the paywall isn't the first thing they see.
    const firstChapter = purchase
        ? chapters[0]
        : chapters.find((chapter) => chapter.isFree) ?? chapters[0]

    return redirect(`/courses/${course.id}/chapters/${firstChapter.id}`)
}
