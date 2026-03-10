import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { auth } from "@clerk/nextjs/server"

import { getStudents } from "@/actions/getStudents"
import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"

import { GroupStudentsClient } from "./_components/GroupStudentsClient"

async function removeStudentFromGroup(input: { groupId: string; studentId: string }) {
  "use server"

  const { userId } = await auth()
  if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

  const group = await db.groupUrl.findUnique({
    where: { id: input.groupId },
    include: {
      course: {
        select: { userId: true },
      },
    },
  })

  if (!group || group.course.userId !== userId) throw new Error("Group not found")

  const nextStudentIds = Array.from(
    new Set(group.studentIds.filter((id) => id !== input.studentId))
  )

  await db.groupUrl.update({
    where: { id: group.id },
    data: {
      studentIds: {
        set: nextStudentIds,
      },
    },
  })
}

async function moveStudentToGroup(input: {
  fromGroupId: string
  toGroupId: string
  studentId: string
}) {
  "use server"

  const { userId } = await auth()
  if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

  const [fromGroup, toGroup] = await Promise.all([
    db.groupUrl.findUnique({
      where: { id: input.fromGroupId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    }),
    db.groupUrl.findUnique({
      where: { id: input.toGroupId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    }),
  ])

  if (!fromGroup || fromGroup.course.userId !== userId) throw new Error("Group not found")
  if (!toGroup || toGroup.course.userId !== userId) throw new Error("Group not found")
  if (fromGroup.courseId !== toGroup.courseId) throw new Error("Groups mismatch")

  const nextFromStudentIds = Array.from(
    new Set(fromGroup.studentIds.filter((id) => id !== input.studentId))
  )

  const nextToStudentIds = Array.from(new Set([...toGroup.studentIds, input.studentId]))

  await db.$transaction([
    db.groupUrl.update({
      where: { id: fromGroup.id },
      data: {
        studentIds: {
          set: nextFromStudentIds,
        },
      },
    }),
    db.groupUrl.update({
      where: { id: toGroup.id },
      data: {
        studentIds: {
          set: nextToStudentIds,
        },
      },
    }),
  ])
}

export default async function GroupStudentsPage({
  params,
}: Readonly<{
  params: Promise<{ groupId: string }>
}>) {
  const { groupId } = await params
  const { userId } = await auth()

  if (!userId) redirect("/")
  if (!isTeacher(userId)) redirect("/")

  const group = await db.groupUrl.findUnique({
    where: { id: groupId },
    include: {
      course: {
        select: {
          title: true,
          userId: true,
        },
      },
    },
  })

  if (!group || group.course.userId !== userId) redirect("/teacher/groups")

  const students = await getStudents()
  const studentsById = new Map(students.map((s) => [s.id, s]))

  const memberIds = Array.from(new Set(group.studentIds))
  const members = memberIds
    .map((id) => {
      const s = studentsById.get(id)
      return {
        id,
        fullName: s?.fullName ?? null,
        email: s?.email ?? "",
      }
    })
    .sort((a, b) => (a.fullName ?? a.id).localeCompare(b.fullName ?? b.id))

  const otherGroups = await db.groupUrl.findMany({
    where: {
      courseId: group.courseId,
      NOT: { id: group.id },
    },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Link
          href="/teacher/groups"
          className="inline-flex items-center text-sm hover:opacity-75 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to groups
        </Link>

        <div>
          <div className="text-2xl font-semibold">
            {group.name && group.name.trim() !== "" ? group.name : "Group"}
          </div>
          <div className="text-sm text-muted-foreground">{group.course.title}</div>
        </div>
      </div>

      <GroupStudentsClient
        groupId={group.id}
        students={members}
        otherGroups={otherGroups.map((g) => ({
          id: g.id,
          name: g.name && g.name.trim() !== "" ? g.name : "Group",
        }))}
        onRemove={async (studentId) => {
          "use server"
          await removeStudentFromGroup({ groupId: group.id, studentId })
        }}
        onMove={async (input) => {
          "use server"
          await moveStudentToGroup({
            fromGroupId: group.id,
            toGroupId: input.toGroupId,
            studentId: input.studentId,
          })
        }}
      />
    </div>
  )
}

