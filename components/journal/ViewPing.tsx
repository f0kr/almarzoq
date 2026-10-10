"use client"

import { useEffect } from "react"

/**
 * Registers a read, once, three seconds after the article mounts.
 *
 * Client-side and delayed on purpose: counting server-side would also count
 * crawlers and Next's own prefetches, and someone who bounces in under three
 * seconds didn't read anything. Dedupe per visitor per day happens server-side.
 */
export function ViewPing({ articleId }: { articleId: string }) {
  useEffect(() => {
    let cancelled = false

    const timer = setTimeout(() => {
      if (cancelled) return
      fetch("/api/journal/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
        keepalive: true,
      }).catch(() => {
        // A view that doesn't record is not worth telling the reader about.
      })
    }, 3000)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [articleId])

  return null
}
