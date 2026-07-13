import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("skeleton-shimmer rounded-lg", className)}
      {...props}
    />
  )
}

/* Course-grid skeleton matching the CourseCard layout (states card) */
function CourseGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-beige bg-card p-2.5">
          <Skeleton className="aspect-video rounded-xl" />
          <Skeleton className="mt-2.5 h-3 w-[55%]" />
          <Skeleton className="mt-2.5 h-3 w-[80%]" />
          <Skeleton className="mt-2.5 h-3 w-[55%]" />
        </div>
      ))}
    </div>
  )
}

export { Skeleton, CourseGridSkeleton }
