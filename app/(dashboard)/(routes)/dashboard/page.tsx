import Link from "next/link"
import { UserCog } from "lucide-react"
import { getDashboardCourses } from "@/actions/getDashboardCourses"
import { auth } from "@/lib/auth"
import MyCourses, { DashboardCourseItem } from "./_components/MyCourses"
import type { Metadata } from "next"

// Personalised learner surface — no public content to index.
export const metadata: Metadata = {
  title: "My Learning",
  robots: { index: false, follow: false },
}

export default async function Dashboard() {

const {userId }= await auth()

const {
  completedCourses,
  coursesInProgress
} = await getDashboardCourses(userId || "")

const toItem = (
  course: (typeof coursesInProgress)[number],
  status: DashboardCourseItem["status"]
): DashboardCourseItem => ({
  id: course.id,
  title: course.title,
  imageUrl: course.imageUrl!,
  chaptersLength: course.chapters.length,
  price: course.price!,
  progress: course.progress,
  category: course.category?.name ?? "Uncategorized",
  masters: (course.teachers ?? [])
    .filter((t) => t.name)
    .map((t) => ({ name: t.name, profileUrl: t.profileUrl })),
  status,
})

const items = [
  ...coursesInProgress.map((c) => toItem(c, "in-progress")),
  ...completedCourses.map((c) => toItem(c, "completed")),
]

return(
  <div className="p-6 space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-serif font-semibold text-2xl md:text-[28px]">My Learning</h1>
      {userId && (
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center rounded-full border border-clay bg-card px-4 py-1.5 text-sm font-semibold text-clay shadow-sm transition hover:bg-paper"
        >
          <UserCog className="mr-2 h-4 w-4" />
          Edit profile
        </Link>
      )}
    </div>
    <MyCourses items={items} />
  </div>
)
}
