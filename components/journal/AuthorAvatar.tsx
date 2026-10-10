import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * The avatar fallback chain the journal promises: the picture the author
 * uploaded, else their account picture (already resolved into avatarUrl when
 * the profile is saved), else their initial on clay. Never a broken image.
 */
export function AuthorAvatar({
  name,
  avatarUrl,
  size = 40,
  className,
}: {
  name: string
  avatarUrl: string | null
  size?: number
  className?: string
}) {
  const initial = name.trim().charAt(0) || "؟"

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full bg-clay-tint",
        className
      )}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        <span
          aria-hidden
          className="flex h-full w-full items-center justify-center font-semibold text-clay"
          style={{ fontSize: size * 0.45 }}
        >
          {initial}
        </span>
      )}
    </span>
  )
}
