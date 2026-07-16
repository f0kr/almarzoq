"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import qs from "query-string"

interface CategoryItemProps {
  label: string
  value?: string | null
  iconUrl?: string | null
  Icon?: LucideIcon
  isPending: boolean
  isActive: boolean
  onSelect: (value: string | null, navigate: () => void) => void
}

export default function CategoryItem({
  label,
  value,
  iconUrl,
  Icon,
  isPending,
  isActive,
  onSelect,
}: CategoryItemProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategoryId = searchParams.get("categoryId")
  const currentTitle = searchParams.get("title")

  // "All" has no value → selected when nothing is filtered
  const isSelected = value ? currentCategoryId === value : !currentCategoryId

  const navigate = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          title: currentTitle,
          categoryId: isSelected ? null : value,
        },
      },
      { skipNull: true, skipEmptyString: true }
    )

    router.push(url)
  }

return (
  <button
    type="button"
    disabled={isPending && !isActive}
    onClick={() => onSelect(value ?? null, navigate)}
    className={cn(
      "flex items-center gap-x-2 rounded-full border px-4 py-2 text-sm font-medium transition",
      "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground",
      isSelected && "border-primary bg-primary text-primary-foreground hover:text-primary-foreground",
      isPending && !isActive && "cursor-not-allowed opacity-50"
    )}
  >
    {/* ICON / SPINNER */}
    {isPending && isActive ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    ) : Icon ? (
      <Icon className="h-4 w-4 shrink-0" />
    ) : iconUrl ? (
      <img src={iconUrl} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
    ) : null}

    <span className="truncate">{label}</span>
  </button>
)

}
