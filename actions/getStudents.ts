import { isTeacher } from "@/lib/teacher"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function getStudents() {
  const { userId } = await auth()

  if (!isTeacher(userId)) return redirect("/")

  let allUsers: any[] = []
  let hasMore = true

  while (hasMore) {
    const res = (await clerkClient()).users.getUserList({
      limit: 1000,
    })

    allUsers = [...allUsers, ...(await res).data]

    hasMore = (await res).data.length > 0
  }

  const students = allUsers.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    createdAt: user.createdAt,
  }))

  return students
}
