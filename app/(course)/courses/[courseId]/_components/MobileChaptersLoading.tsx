"use client"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useChapterLoadingStore } from "@/hooks/use-chapter-loading-store"

/**
 * Mobile only: holds the chapter list behind a skeleton until the chapter
 * page reports its video player is ready, matching the page-level skeleton
 * (see ChapterLoadingProvider).
 */
export function MobileChaptersLoading({
  children,
}: {
  children: React.ReactNode
}) {
  const isReady = useChapterLoadingStore((s) => s.isReady)

  return (
    <div className="relative">
      <div className={cn(!isReady && "invisible")}>{children}</div>
      {!isReady && (
        <div aria-hidden className="absolute inset-0">
          <div className="rounded-2xl border border-border bg-card overflow-hidden h-full">
            <div className="px-5 py-[22px] border-b border-border">
              <Skeleton className="h-6 w-3/4" />
            </div>
            <div className="p-5 space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/6" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
