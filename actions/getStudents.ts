import { isTeacher } from "@/lib/teacher"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function getStudents() {
  const { userId } = await auth()
/*   if (!isTeacher(userId)) return redirect("/")
 */
  const limit = 100             
  let offset = 0
  const allUsers: any[] = []
  let totalCount = Infinity

  while (offset < totalCount) {
    const res = (await clerkClient()).users.getUserList({
      limit,
      offset,
    })

    allUsers.push(...(await res).data)

    if (typeof (await res).totalCount === "number") totalCount = (await res).totalCount

    if ((await res).data.length === 0) break

    offset += (await res).data.length
  }

  const students = allUsers.map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.emailAddresses?.[0]?.emailAddress ?? "",
    createdAt: user.createdAt,
  }))

  return students
}
