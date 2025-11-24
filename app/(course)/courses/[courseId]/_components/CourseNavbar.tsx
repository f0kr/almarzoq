import NavBarRoutes from "@/components/NavBarRoutes";
import { Chapter, Course, Lecture, UserProgress } from "@prisma/client";
import CourseMobileSidebar from "./CourseMobileSidebar";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";


interface CourseNavbarProps {
  course: Course & {
    lectures: (Lecture & {
      chapters: (Chapter & {
        userProgress: UserProgress[];
      })[];
    })[];
  };
    progressCount: number
}

export default async function CourseNavbar({
    course,
    progressCount
}: CourseNavbarProps){

        const {userId} = await auth()
        
    
    
          const purchase = await db.purchase.findUnique({
            where: {
                userId_courseId: {
                    userId: userId || "",
                    courseId: course.id
                }
            }
          })

  return(
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
        <CourseMobileSidebar
        course={course}
        progressCount={progressCount}
        purchase={purchase}
        />
        <NavBarRoutes/>
    </div>
  )
}