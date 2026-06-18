import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { auth } from "@clerk/nextjs/server"

import { getStudents } from "@/actions/getStudents"
import { isTeacher } from "@/lib/teacher"

import Groups from "./_components/Groups"

export default async function GroupPage({
  params,
}: {
  params: Promise<{ studentId: string; courseId: string }>
}) {
  const { studentId, courseId } = await params

  const { userId } = await auth()
  if (!userId) redirect("/")
  if (!isTeacher(userId)) redirect("/")

  const students = await getStudents()
  const student = students.find((s) => s.id === studentId)

  return (
    <div>
      <Link
        href="/teacher/students"
        className="flex items-center text-sm hover:opacity-75 transition mb-6 p-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to student page
      </Link>

      <div className="pb-3 pl-3">
        Manage groups for{" "}
        <span className="font-semibold">{student?.fullName || "Unknown student"}</span>
      </div>

      <Groups courseId={courseId} studentId={studentId} />
    </div>
  )
}
