import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col max-w-4xl mx-auto pb-20">
      {/* video */}
      <div className="p-4">
        <Skeleton className="aspect-video rounded-xl" />
      </div>

      {/* title + action button */}
      <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      {/* description */}
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
