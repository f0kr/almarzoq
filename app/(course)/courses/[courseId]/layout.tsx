import { getProgress } from "@/actions/getProgress";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CourseSidebar from "./_components/CourseSidebar";
import CourseNavbar from "./_components/CourseNavbar";

const CourseLayout = async ({
    children,
    params
}: {children: React.ReactNode; params: Promise<{courseId: string}>})=> {
    
    const {userId} = await auth()
    const {courseId} = await params


        const course = await db.course.findUnique({
            where: {
                id: courseId
            },
            include: {
                lectures: {
                    include: {
                        chapters: {
                    where: {
                        isPublished: true
                    },
                    include: {
                        userProgress: {
                            where: {
                                userId: userId || ""
                            }
                        }
                    },
                    orderBy: {
                        position: "asc"
                    }
                }
                    },
                    orderBy: {
                        position: 'asc'
                    }
                }
            }
        })

        if(!course) return redirect("/")

        const purchase = await db.purchase.findUnique({
         where: {
            userId_courseId: {
                userId: userId || "",
                courseId: course.id
            }
         }
      })

        const progressCount = await getProgress(course.id, userId || "")
    
    return(
        <div className="h-full">
            <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
                <CourseNavbar
                course={course}
                progressCount={progressCount}
                />
            </div>
            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
              <CourseSidebar
              course={course}
              progressCount={progressCount}
              purchase={purchase}
              />
            </div>
            <main className="md:pl-80 pt-[80px] h-full">
            {children}
            </main>

        </div>
    )
}

export default CourseLayout