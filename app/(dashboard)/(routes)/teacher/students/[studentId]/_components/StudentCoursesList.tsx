import { Category, Course } from "@prisma/client"
import { StudentCourseCard } from "./StudentCourseCard"



export function StudentCoursesList({
  items,
  studentId,
}: {
  items: Course[]
  studentId: string
}){

    return(
      <div>
        <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {items.map((item)=> 
            {
              if (item.isPublished)
              {
                return (
                  <StudentCourseCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    imageUrl={item.imageUrl!}
                    price={item.price!}
                    studentId={studentId}
                  />
                )
              }
            }
          )}
            
        </div>
        {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground mt-10">
                No courses found
            </div>
        )}
       </div>
    )
    
}