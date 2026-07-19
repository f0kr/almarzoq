"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface RevealProps {
  children: React.ReactNode
  /** ms before the transition starts once visible — use for staggering siblings */
  delay?: number
  className?: string
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      // toggle rather than fire-once so the reveal replays when the
      // element scrolls out of view and back in
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "0px 0px -40px 0px", threshold: 0.1 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn("reveal", isVisible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
