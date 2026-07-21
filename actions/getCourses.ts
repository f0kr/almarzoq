import { db } from "@/lib/db";
import { Category, Course } from "@prisma/client";
import Fuse from "fuse.js";
import { getProgress } from "./getProgress";

type CourseWithProgressWithCategory = Course & {
    category: Category | null
    chapters: {id : string}[]
    progress: number | null
    teachers: { id: string, name: string, profileUrl: string | null }[]
}

type GetCourses = {
    userId?: string | null
    title?: string
    categoryId?: string
    free?: Boolean
}

export async function getCourses({
 userId,
 title,
 categoryId,
 free
}: GetCourses): Promise<CourseWithProgressWithCategory[]>{
try{
const allCourses = await db.course.findMany({
    where: {
        isPublished: true,
        categoryId,
        ...(free ? 
               {
             price: 0 
        } : {}),
    },
    include: {
        category: true,
        chapters: {
            where: {
                isPublished: true
            },
            select: {
                id: true
            }
        },
        teachers: {
            select: {
                id: true,
                name: true,
                profileUrl: true
            }
        },
        purchases: {
            where: {
                userId: userId || ""
            }
        }
    },
    orderBy: {
        createdAt: "desc"
    }
})

    // Fuzzy search over course titles AND teacher names: typo-tolerant,
    // case-insensitive, and script-agnostic (works for Arabic and Latin
    // alike — Prisma's `contains` was case-sensitive, which silently broke
    // Latin-script queries). Results come back ranked by relevance.
    const courses = title?.trim()
        ? new Fuse(allCourses, {
              keys: [
                  { name: "title", weight: 2 },
                  { name: "teachers.name", weight: 1 },
              ],
              threshold: 0.35,
              ignoreLocation: true,
          })
              .search(title.trim())
              .map((result) => result.item)
        : allCourses

    const coursesWithProgress: CourseWithProgressWithCategory[] = await Promise.all(
       courses.map(async course => {
        if(course.purchases.length === 0){
            return{
                ...course,
                progress: null
            }
        }

        const progressPercentage = await getProgress(course.id , userId || "" )


        return{
            ...course,
            progress: progressPercentage
        }
       }) 
    )

    return coursesWithProgress

}catch (error){
    console.log("GET_COURSES", error)
    return []
}
}
