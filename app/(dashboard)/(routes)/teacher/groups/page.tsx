import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"

import { GroupsClient } from "./_components/GroupsClient"

async function createGroup(input: { courseId: string; name: string; url: string }) {
  "use server"

  const { userId } = await auth()
  if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

  const course = await db.course.findFirst({
    where: {
      id: input.courseId,
      userId,
    },
    select: { id: true },
  })

  if (!course) throw new Error("Course not found")
  if (!input.url || input.url.trim() === "") throw new Error("Missing URL")

  await db.groupUrl.create({
    data: {
      courseId: input.courseId,
      name: input.name ?? "",
      url: input.url,
    },
  })
}

async function updateGroup(input: { id: string; name: string; url: string }) {
  "use server"

  const { userId } = await auth()
  if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

  const group = await db.groupUrl.findUnique({
    where: { id: input.id },
    include: {
      course: {
        select: { userId: true },
      },
    },
  })

  if (!group || group.course.userId !== userId) throw new Error("Group not found")
  if (!input.url || input.url.trim() === "") throw new Error("Missing URL")

  await db.groupUrl.update({
    where: { id: input.id },
    data: {
      name: input.name ?? "",
      url: input.url,
    },
  })
}

async function deleteGroup(id: string) {
  "use server"

  const { userId } = await auth()
  if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

  const group = await db.groupUrl.findUnique({
    where: { id },
    include: {
      course: {
        select: { userId: true },
      },
    },
  })

  if (!group || group.course.userId !== userId) throw new Error("Group not found")

  await db.groupUrl.delete({
    where: { id },
  })
}

export default async function GroupsPage() {
  const { userId } = await auth()

  if (!userId) redirect("/")
  if (!isTeacher(userId)) redirect("/")

  const courses = await db.course.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  })

  const groups = await db.groupUrl.findMany({
    where: {
      course: {
        userId,
      },
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const data = groups.map((group) => ({
    id: group.id,
    name: group.name,
    url: group.url,
    studentIds: group.studentIds,
    courseId: group.courseId,
    courseTitle: group.course.title,
    createdAt: group.createdAt.toISOString(),
  }))

  return (
    <div className="p-6">
      <GroupsClient
        courses={courses}
        groups={data}
        onCreate={createGroup}
        onUpdate={updateGroup}
        onDelete={deleteGroup}
      />
    </div>
  )
}
