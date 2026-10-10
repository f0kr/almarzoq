"use client"

import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import qs from "query-string"
import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

type Category = { id: string; name: string; nameAr: string | null }
type Editor = { id: string; displayName: string }

const ALL = "__all__"

/**
 * Filters live in the URL, like the course catalogue's SearchInput — so a
 * filtered view can be linked, shared and back-buttoned.
 */
export function JournalFilters({
  categories,
  editors,
}: {
  categories: Category[]
  editors: Editor[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const debouncedQ = useDebounce(q)

  const categoryId = searchParams.get("categoryId") ?? ALL
  const editorId = searchParams.get("editorId") ?? ALL
  const from = searchParams.get("from") ?? ""
  const to = searchParams.get("to") ?? ""

  const push = (next: Record<string, string | undefined>) => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          q: debouncedQ || undefined,
          categoryId: categoryId === ALL ? undefined : categoryId,
          editorId: editorId === ALL ? undefined : editorId,
          from: from || undefined,
          to: to || undefined,
          ...next,
        },
      },
      { skipNull: true, skipEmptyString: true }
    )
    startTransition(() => router.push(url))
  }

  // The text box drives the URL on its own debounce; the selects push directly.
  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          q: debouncedQ || undefined,
          categoryId: categoryId === ALL ? undefined : categoryId,
          editorId: editorId === ALL ? undefined : editorId,
          from: from || undefined,
          to: to || undefined,
        },
      },
      { skipNull: true, skipEmptyString: true }
    )
    startTransition(() => router.push(url))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  const hasFilters =
    Boolean(q) || categoryId !== ALL || editorId !== ALL || Boolean(from) || Boolean(to)

  return (
    <div className={cn("space-y-3", isPending && "opacity-70")}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles, authors…"
          className="w-full rounded-full border-beige bg-card pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={categoryId} onValueChange={(value) => push({ categoryId: value === ALL ? undefined : value })}>
          <SelectTrigger className="w-full rounded-full sm:w-[190px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.nameAr ?? category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={editorId} onValueChange={(value) => push({ editorId: value === ALL ? undefined : value })}>
          <SelectTrigger className="w-full rounded-full sm:w-[190px]">
            <SelectValue placeholder="All editors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All editors</SelectItem>
            {editors.map((editor) => (
              <SelectItem key={editor.id} value={editor.id}>
                {editor.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* The date pair shares one row and splits the width, rather than each
            one claiming its intrinsic width and overflowing a 360px screen. */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground sm:flex-none">
            From
            <input
              type="date"
              value={from}
              onChange={(e) => push({ from: e.target.value || undefined })}
              className="h-9 w-full min-w-0 rounded-full border border-beige bg-card px-3 text-sm text-foreground sm:w-auto"
            />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground sm:flex-none">
            To
            <input
              type="date"
              value={to}
              onChange={(e) => push({ to: e.target.value || undefined })}
              className="h-9 w-full min-w-0 rounded-full border border-beige bg-card px-3 text-sm text-foreground sm:w-auto"
            />
          </label>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQ("")
              startTransition(() => router.push(pathname))
            }}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
