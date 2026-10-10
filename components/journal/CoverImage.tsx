import Image from "next/image"
import { cn } from "@/lib/utils"

interface CoverImageProps {
  src: string | null
  alt?: string
  /** Tailwind aspect-ratio classes — the frame every cover is fitted into. */
  className?: string
  sizes: string
  priority?: boolean
  children?: React.ReactNode
}

/**
 * A cover of any shape, in a frame of one shape.
 *
 * Authors upload whatever they have — 16:9 screenshots, phone portraits,
 * square scans. `object-cover` would give a tidy grid by slicing the subject
 * out of a tall image; `object-contain` alone would keep the picture whole but
 * strand it on empty paper.
 *
 * So the picture is drawn twice: an over-scaled, blurred copy fills the frame,
 * and the real one is contained on top of it. Nothing is cropped, every card
 * is the same height, and a portrait cover sits on its own colours. The second
 * request is the same URL, so it is served from cache.
 */
export function CoverImage({
  src,
  alt = "",
  className,
  sizes,
  priority,
  children,
}: CoverImageProps) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-paper", className)}>
      {src && (
        <>
          {/* aria-hidden: the same picture, announced once. */}
          <Image
            src={src}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            unoptimized
            className="scale-125 object-cover blur-2xl"
          />
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            unoptimized
            priority={priority}
            className="object-contain"
          />
        </>
      )}
      {children}
    </div>
  )
}
