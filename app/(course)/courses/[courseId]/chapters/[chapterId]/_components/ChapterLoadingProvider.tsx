"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { cn } from "@/lib/utils"
import { useChapterLoadingStore } from "@/hooks/use-chapter-loading-store"
import { ChapterSkeleton } from "./ChapterSkeleton"

const ChapterLoadingContext = createContext<{ markReady: () => void }>({
  markReady: () => {},
})

/** Called by the video player once it can actually play (or is locked). */
export function useChapterLoading() {
  return useContext(ChapterLoadingContext)
}

/**
 * Keeps a full-page skeleton over the chapter content until the video
 * player reports it is ready, so the page reveals as one unit instead of
 * content first and a loading player after. The content stays mounted
 * underneath so the player can load while the skeleton shows.
 */
export function ChapterLoadingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isReady, setIsReady] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)

  const markReady = useCallback(() => {
    setIsReady(true)
    useChapterLoadingStore.getState().markReady()
  }, [])

  // Keep the layout's mobile chapter list in sync: not-ready while this
  // chapter's player is still loading.
  useEffect(() => {
    useChapterLoadingStore.getState().reset()
  }, [])

  // Unmount the overlay after its fade-out finishes.
  useEffect(() => {
    if (!isReady) return
    const timeout = setTimeout(() => setShowSkeleton(false), 350)
    return () => clearTimeout(timeout)
  }, [isReady])

  // Safety net: never trap the page in a skeleton if the player fails to
  // report (missing playback id, network error the player swallows, …).
  useEffect(() => {
    const timeout = setTimeout(markReady, 10000)
    return () => clearTimeout(timeout)
  }, [markReady])

  return (
    <ChapterLoadingContext.Provider value={{ markReady }}>
      <div className="relative">
        {children}
        {showSkeleton && (
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 z-10 bg-background transition-opacity duration-300",
              isReady && "opacity-0 pointer-events-none"
            )}
          >
            <ChapterSkeleton />
          </div>
        )}
      </div>
    </ChapterLoadingContext.Provider>
  )
}
