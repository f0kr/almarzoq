import { db } from "@/lib/db"

export async function getGroups(courseId: string) {

  const groups = await db.groupUrl.findMany({
    where: {
      courseId
    }
  })

  return groups
}
