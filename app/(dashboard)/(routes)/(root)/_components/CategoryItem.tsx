"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import qs from "query-string"

interface CategoryItemProps {
  label: string
  value?: string | null
  iconUrl?: string | null
  Icon?: LucideIcon
  isPending: boolean
  isActive: boolean
  onSelect: (value: string, navigate: () => void) => void
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

  const isSelected = currentCategoryId === value

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
    onClick={() => onSelect(value!, navigate)}
    className={cn(
      "flex items-center gap-x-2 rounded-full border px-3 py-2 text-sm transition",
      "border-slate-200 hover:border-red-700",
      isSelected && "border-red-700 bg-red-200/20 text-red-800",
      isPending && !isActive && "cursor-not-allowed opacity-50"
    )}
  >
    {/* ICON / SPINNER */}
    {isPending && isActive ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
    ) : Icon ? (
      <Icon className="h-5 w-5 text-slate-600 shrink-0" />
    ) : iconUrl ? (
      <img
        src={iconUrl}
        alt={label}
        className="h-5 w-5 shrink-0"
      />
    ) : null}

    {/* LABEL */}
    <span className="truncate">{label}</span>
  </button>
)

}
