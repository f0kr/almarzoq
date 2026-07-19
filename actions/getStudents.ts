import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function getStudents() {
  const { userId } = await auth()
  if (!isTeacher(userId)) return redirect("/")

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  const students = users.map((user) => ({
    id: user.id,
    fullName: user.name ?? "",
    email: user.email,
    createdAt: user.createdAt.getTime(),
  }))

  return students
}
