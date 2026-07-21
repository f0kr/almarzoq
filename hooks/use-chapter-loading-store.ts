import { create } from "zustand"

/**
 * Shared "is the chapter video player ready" flag. Written by the chapter
 * page's ChapterLoadingProvider; read by the course layout's mobile chapter
 * list so it can show its skeleton in sync with the page overlay.
 */
type ChapterLoadingStore = {
  isReady: boolean
  markReady: () => void
  reset: () => void
}

export const useChapterLoadingStore = create<ChapterLoadingStore>((set) => ({
  isReady: false,
  markReady: () => set({ isReady: true }),
  reset: () => set({ isReady: false }),
}))
