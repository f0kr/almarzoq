import { auth } from "@clerk/nextjs/server"

import { getGroups } from "@/actions/getGroups"
import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"

import { StudentGroupsClient } from "./StudentGroupsClient"

function normalizeGroupName(name: string | null) {
  return name && name.trim() !== "" ? name : "Group"
}

export default async function Groups({
  studentId,
  courseId,
}: {
  studentId: string
  courseId: string
}) {
  const groups = await getGroups(courseId)

  async function addStudentToGroup(groupId: string) {
    "use server"

    const { userId } = await auth()
    if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

    const group = await db.groupUrl.findUnique({
      where: { id: groupId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    })

    if (!group || group.course.userId !== userId || group.courseId !== courseId) {
      throw new Error("Group not found")
    }

    const nextStudentIds = Array.from(new Set([...group.studentIds, studentId]))

    await db.groupUrl.update({
      where: { id: group.id },
      data: {
        studentIds: {
          set: nextStudentIds,
        },
      },
    })
  }

  async function removeStudentFromGroup(groupId: string) {
    "use server"

    const { userId } = await auth()
    if (!userId || !isTeacher(userId)) throw new Error("Unauthorized")

    const group = await db.groupUrl.findUnique({
      where: { id: groupId },
      include: {
        course: {
          select: { userId: true },
        },
      },
    })

    if (!group || group.course.userId !== userId || group.courseId !== courseId) {
      throw new Error("Group not found")
    }

    const nextStudentIds = Array.from(new Set(group.studentIds.filter((id) => id !== studentId)))

    await db.groupUrl.update({
      where: { id: group.id },
      data: {
        studentIds: {
          set: nextStudentIds,
        },
      },
    })
  }

  async function moveStudentToGroup(input: { fromGroupId: string; toGroupId: string }) {
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

    if (
      !fromGroup ||
      fromGroup.course.userId !== userId ||
      fromGroup.courseId !== courseId
    ) {
      throw new Error("Group not found")
    }

    if (!toGroup || toGroup.course.userId !== userId || toGroup.courseId !== courseId) {
      throw new Error("Group not found")
    }

    const nextFromStudentIds = Array.from(
      new Set(fromGroup.studentIds.filter((id) => id !== studentId))
    )

    const nextToStudentIds = Array.from(new Set([...toGroup.studentIds, studentId]))

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

  const rows = groups
    .map((g) => ({
      id: g.id,
      name: g.name,
      url: g.url,
      isMember: g.studentIds.includes(studentId),
    }))
    .sort((a, b) => normalizeGroupName(a.name).localeCompare(normalizeGroupName(b.name)))

  const options = groups.map((g) => ({ id: g.id, name: normalizeGroupName(g.name) }))

  return (
    <div className="p-6">
      <StudentGroupsClient
        groups={rows.map((r) => ({
          ...r,
          name: normalizeGroupName(r.name),
        }))}
        groupOptions={options}
        onAdd={addStudentToGroup}
        onRemove={removeStudentFromGroup}
        onMove={moveStudentToGroup}
      />
    </div>
  )
}
