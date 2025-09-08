"use client"

import { Search } from "lucide-react"
import { Input } from "./ui/input"
import { useDebounce } from "@/hooks/use-debounce"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import qs from "query-string"
import { Button } from "./ui/button"

const SearchInputInner = ()=> {

    const [value, setValue] = useState("")
    const [showFree, setShowFree] = useState(false)
    const debounceValue = useDebounce(value)

    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const currentcategoryId = searchParams.get("categoryId")

    useEffect(()=> {
        const url = qs.stringifyUrl({
            url: pathname,
            query: {
                categoryId: currentcategoryId,
                title: debounceValue,
                free: showFree ? "1" : undefined,
            }
        }, {skipNull: true, skipEmptyString: true})
        router.push(url)
    }, [debounceValue, currentcategoryId, router, pathname, showFree])
    
    return (
      <div className="flex w-full md:w-[350px] items-center gap-2">
      <div className="relative flex-1">
        <Search className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
        <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        className="w-full pl-9 rounded-full bg-slate-100 focus-visible:ring-slate-200"
        placeholder="Search for a course"
        />
      </div>
      <Button
        size="sm"
        variant={showFree ? "default" : "outline"}
        onClick={() => setShowFree((prev) => !prev)}
        className={`rounded-full px-4 transition-colors ${showFree ? "bg-slate-900 text-white" : ""}`}
      >
        Free
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