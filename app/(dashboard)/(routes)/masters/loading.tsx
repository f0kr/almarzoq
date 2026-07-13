import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-80" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="space-y-4 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
