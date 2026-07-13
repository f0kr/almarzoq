import { Category, Course } from "@prisma/client"
import { CourseCard } from "./CourseCard"
import { auth } from "@clerk/nextjs/server"
import { SignInButton } from "@clerk/nextjs"
import { EmptyState } from "./EmptyState"

type CourseWithProgressWithCategory = Course & {
    category: Category | null
    chapters: {id: string}[]
    progress: number | null
    teachers?: {id: string, name: string, profileUrl?: string | null}[]
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
                masters={(item.teachers ?? []).filter((t)=> t.name).map((t)=> ({ name: t.name, profileUrl: t.profileUrl }))}
                />
            ))}
        </div>
        {items.length === 0 && userId && (
            <EmptyState
                className="mt-10"
                title="No courses found"
                description="When you enroll in a course it will show up here. Explore the catalog to find your first one."
            />
        )}
        {items.length === 0 && !userId && (
            <EmptyState
                className="mt-10"
                title="Sign in to track progress"
                description="Your enrolled courses and progress will show up here."
                action={
                    <SignInButton mode="modal">
                        <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-tan">
                            Sign in
                        </button>
                    </SignInButton>
                }
            />
        )}
       </div>
    )
    
}
