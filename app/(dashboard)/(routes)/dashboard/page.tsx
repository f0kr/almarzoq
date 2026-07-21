import { getDashboardCourses } from "@/actions/getDashboardCourses"
import { CoursesList } from "@/components/CoursesList"
import { auth } from "@/lib/auth"
import { CheckCircle2, Clock } from "lucide-react"
import { InfoCard } from "./_components/InfoCard"
import Reveal from "@/components/Reveal"
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

return(
  <div className="p-6 space-y-4">
    <h1 className="font-serif font-semibold text-2xl md:text-[28px]">My Learning</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Reveal>
      <InfoCard
      icon={Clock}
      label='In Progress'
      numberOfItems={coursesInProgress.length}
      />
      </Reveal>
      <Reveal delay={70}>
      <InfoCard
      icon={CheckCircle2}
      label='Completed'
      numberOfItems={completedCourses.length}
      variant="success"
      />
      </Reveal>
    </div>
    <CoursesList
    items={[...coursesInProgress, ...completedCourses]}
    />
  </div>
)
}
