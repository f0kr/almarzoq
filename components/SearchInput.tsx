"use client"

import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState, useTransition } from "react"
import qs from "query-string"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const SearchInputInner = ()=> {

    const [value, setValue] = useState("")
    const [showFree, setShowFree] = useState(false)
    const debounceValue = useDebounce(value)

    const [isPending, startTransition] = useTransition()

    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const currentcategoryId = searchParams.get("categoryId")

    useEffect(()=> {
      startTransition(() => {
      const url = qs.stringifyUrl({
          url: pathname,
          query: {
              categoryId: currentcategoryId,
              title: debounceValue,
              free: showFree ? "1" : undefined,
          }
      }, {skipNull: true, skipEmptyString: true})
      router.push(url)
    })
    }, [debounceValue, currentcategoryId, router, pathname, showFree])
    
    return (
      <div className="flex w-full md:w-[350px] items-center gap-2">
      <div className="relative flex-1">
        <Search className="h-4 w-4 absolute top-3 left-3 text-muted-foreground" />
        <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full pl-9 rounded-full bg-paper border-beige"
        placeholder="Search courses & masters…"
        />
      </div>
      <Button
        disabled={isPending}
        size="sm"
        variant="ghost"
        onClick={() => setShowFree((prev) => !prev)}
        className={cn(
              "flex items-center gap-x-2 rounded-full border px-3 py-2 text-sm transition",
              "bg-grey border-transparent text-white font-medium hover:bg-ink",
              showFree && "bg-card border-primary text-primary hover:bg-card hover:text-primary",
              isPending && "cursor-not-allowed opacity-50"
            )}
      >
    {isPending ? (
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    ) : "Free"}
      </Button>
      </div>
    )
}

export function SearchInput() {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchInputInner />
    </Suspense>
  );
}