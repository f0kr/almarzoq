import { CourseGridSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="p-6 space-y-4">
      <CourseGridSkeleton />
    </div>
  )
}
