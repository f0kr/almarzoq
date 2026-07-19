import { getProgress } from "@/actions/getProgress";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CourseSidebar from "./_components/CourseSidebar";
import CourseNavbar from "./_components/CourseNavbar";
import { MobileChaptersLoading } from "./_components/MobileChaptersLoading";

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
            {/* sticky (not fixed): in-app browsers (e.g. Telegram on iOS) misplace
                fixed elements when their collapsing top bar resizes the viewport */}
            <div className="md:pl-80 sticky top-0 w-full z-50 bg-sidebar pt-[env(safe-area-inset-top,0px)] h-[calc(80px+env(safe-area-inset-top,0px))]">
                <CourseNavbar />
            </div>
            {/* Desktop: chapters in a fixed side rail */}
            <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
              <CourseSidebar
              course={course}
              progressCount={progressCount}
              purchase={purchase}
              className="h-full rounded-none border-0 border-r border-border bg-background overflow-y-auto shadow-sm"
              />
            </div>
            <main className="md:pl-80 h-full">
            {children}
            {/* Mobile: chapters below the course content; skeleton until the
                chapter's video player is ready (desktop side rail is unaffected) */}
            <div className="max-w-4xl mx-auto px-4 pb-20 md:hidden">
              <MobileChaptersLoading>
                <CourseSidebar
                course={course}
                progressCount={progressCount}
                purchase={purchase}
                />
              </MobileChaptersLoading>
            </div>
            </main>

        </div>
    )
}

export default CourseLayout