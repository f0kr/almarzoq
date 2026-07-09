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

interface CategoryFormProps {
  name: string
  categoryId: string
}


export default function CategoryEdit({
  name,
  categoryId
}: CategoryFormProps)
{

      const [isLoading, setIsLoading] = useState(false)
      const [open, setOpen] = useState(false)

      const [categoryName, setCategoryName] = useState<string>(name)

      const router = useRouter()

      const onSubmit = async () => {
        if (categoryName){
        try {
          setIsLoading(true)
          await axios.patch(`/api/categories/${categoryId}`, {
            name: categoryName,
          })
          toast.success("Category edited")
          router.refresh()
        } catch (error) {
          toast.error("Something went wrong.")
          console.log(error)
        }finally {
          setIsLoading(false)
          setOpen(false)
        }
      }else return null
      }
    return (
        <DropdownMenuItem asChild>
            <Popover open={open}>
                <PopoverTrigger className="flex items-center" asChild>
                    <Button onClick={()=>setOpen(!open)} variant="ghost" size="icon">
                    <Pencil className="h-6 w-6 "/>
                    </Button>
                </PopoverTrigger>
<PopoverContent align="end" className="w-80 p-0">
  <div className="rounded-lg border bg-card shadow-sm">

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h4 className="text-sm font-medium">Edit Category</h4>
      <PopoverClose onClick={()=> setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
        Close
      </PopoverClose>
    </div>

    {/* Body */}
    <div className="p-4">
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Category name"
      />
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-2 px-4 py-3 border-t">
      <Button
        size="sm"
        variant="success"
        onClick={onSubmit}
        disabled={isLoading}
      >
        Save
      </Button>
    </div>

  </div>
</PopoverContent>

            </Popover>
        </DropdownMenuItem>
    )
}
