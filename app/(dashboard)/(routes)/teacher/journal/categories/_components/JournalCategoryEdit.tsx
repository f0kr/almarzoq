"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover"
import axios from "axios"
import { Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

interface JournalCategoryEditProps {
  categoryId: string
  name: string
  nameAr: string | null
  isActive: boolean
}

export default function JournalCategoryEdit({
  categoryId,
  name,
  nameAr,
  isActive,
}: JournalCategoryEditProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [categoryName, setCategoryName] = useState(name)
  const [arabicName, setArabicName] = useState(nameAr ?? "")
  const [active, setActive] = useState(isActive)

  const router = useRouter()

  const onSubmit = async () => {
    if (categoryName.trim().length < 2) {
      toast.error("Name must be at least 2 characters")
      return
    }

    try {
      setIsLoading(true)
      await axios.patch(`/api/journal/categories/${categoryId}`, {
        name: categoryName,
        nameAr: arabicName,
        isActive: active,
      })
      toast.success("Category updated")
      router.refresh()
      setOpen(false)
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Something went wrong."
      toast.error(message)
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenuItem asChild>
      <Popover open={open}>
        <PopoverTrigger className="flex items-center" asChild>
          <Button onClick={() => setOpen(!open)} variant="ghost" size="icon">
            <Pencil className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="text-sm font-medium">Edit category</h4>
              <PopoverClose
                onClick={() => setOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </PopoverClose>
            </div>

            <div className="p-4 space-y-3">
              <Input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Name (English)"
              />
              <Input
                dir="rtl"
                lang="ar"
                value={arabicName}
                onChange={(e) => setArabicName(e.target.value)}
                placeholder="الاسم بالعربية (اختياري)"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-clay"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                Offer this category to writers
              </label>
            </div>

            <div className="flex justify-end gap-2 px-4 py-3 border-t">
              <Button size="sm" variant="success" onClick={onSubmit} disabled={isLoading}>
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </DropdownMenuItem>
  )
}
