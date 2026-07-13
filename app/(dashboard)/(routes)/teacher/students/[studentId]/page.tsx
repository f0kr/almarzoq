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
        <div className="p-6">
            <Link
            href={`/teacher/students`}
            className="flex items-center text-sm text-grey hover:text-foreground transition mb-4"
            >
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back to Students
            </Link>
            <div className="flex items-center gap-4 bg-card border border-beige rounded-2xl px-5 py-4 mb-6">
              <span className="h-14 w-14 shrink-0 rounded-full bg-gradient-to-br from-clay to-sage" aria-hidden />
              <div>
                <h1 className="text-xl font-semibold">{student?.fullName || "Unknown student"}</h1>
                <p className="text-[13px] text-grey">Choose a course to add this student to</p>
              </div>
            </div>
            <StudentCoursesList
            items={courses}
            studentId={studentId}
            />
        </div>
    )
}