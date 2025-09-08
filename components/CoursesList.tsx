import { Category, Course } from "@prisma/client"
import { CourseCard } from "./CourseCard"
import { auth } from "@clerk/nextjs/server"
import { SignInButton } from "@clerk/nextjs"

type CourseWithProgressWithCategory = Course & {
    category: Category | null
    chapters: {id: string}[]
    progress: number | null
}

interface CoursesListProps {
    items: CourseWithProgressWithCategory[]
}

export async function CoursesList({
items
}: CoursesListProps){

    const {userId} = await auth()

    return(
      <div>
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {items.map((item)=> (
                <CourseCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl!}
                chaptersLength={item.chapters.length}
                price={item.price!}
                progress={item.progress}
                category={item?.category?.name! ? item.category.name : "Uncategorized"}
                teacherName={item.teacherName}
                />
            ))}
        </div>
        {items.length === 0 && userId && (
            <div className="text-center text-sm text-muted-foreground mt-10">
                No courses found
            </div>
        )}
        {items.length === 0 && !userId && (
            <div className="text-center text-sm text-muted-foreground mt-10">
                      Please{" "}
      <SignInButton mode="modal">
        <button className="font-bold underline hover:text-primary transition">
          sign in
        </button>
      </SignInButton>{" "}
      to track progress
            </div>      
        )}
       </div>
    )
    
}