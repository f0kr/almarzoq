import { isTeacher } from "@/lib/teacher"
import { redirect } from "next/navigation"
import { StudentCoursesList } from "./_components/StudentCoursesList"
import { getStudentCourses } from "@/actions/getStudentCourses"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getStudents } from "@/actions/getStudents"

export default async function StudentPage({ params }: { params: Promise<{ studentId: string }> }) {
    const {studentId} = await params
    const courses = await getStudentCourses(studentId)
    const students = await getStudents()
    const student = students.find((s)=> s.id === studentId)
    if(!isTeacher) redirect("/")


    return (
        <div>
            <Link
            href={`/teacher/students`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6 p-6"
            >
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back to student page
            </Link>
            <div className="pb-3 pl-3">
             Please choose a course for{" "}
             <span className="font-semibold">
              {student?.fullName || "Unknown student"}
             </span>{" "}
              to add to
            </div>
            <StudentCoursesList
            items={courses}
            studentId={studentId}
            />
        </div>
    )
}