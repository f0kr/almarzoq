import { db } from "@/lib/db";

export const getProgress = async (
    courseId: string,
    userId?: string,

): Promise<number> => {
  try{
    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true
      },
      select: {
        id: true
      }
    })

    const publishdedChapterIds = publishedChapters.map((chapter)=> chapter.id)
    const validCompletedChapters = await db.userProgress.count({
        where: {
            userId: userId || "",
            chapterId: {
                in: publishdedChapterIds
            },
            isCompleted: true
        }
    })

    const progressPercentage = (validCompletedChapters / publishdedChapterIds.length) * 100

    return progressPercentage
    
  }catch (error){
    console.log("GET_PROGRESS", error)
    return 0
  }
}