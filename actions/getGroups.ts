

import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { auth} from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function getGroups() {
  const { userId } = await auth()
  if (!isTeacher(userId)) return redirect("/")


  const groups = await db.groupUrl.findMany()

  return groups
}
