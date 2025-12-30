"use client"

import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PopoverClose } from "@radix-ui/react-popover"
import axios from "axios"
import { ImageIcon, Pencil, PlusCircle } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {useState } from "react"
import toast from "react-hot-toast"

interface CategoryFormProps {
  name: string
  oldIconUrl: string | null
  categoryId: string
}


export default function CategoryEdit({
  name,
  oldIconUrl,
  categoryId
}: CategoryFormProps)
{

      const [isEditing, setIsEditing] = useState(false)
      const [isLoading, setIsLoading] = useState(false)
      const [open, setOpen] = useState(false)
      
      const toggleEditing = () => {
        setIsEditing((prev) => !prev)
      }
      
      const [categoryName, setCategoryName] = useState<string>(name)
      const [iconUrl, setIconUrl] = useState<string | null>(oldIconUrl)

      const router = useRouter()
        
      const onSubmit = async () => {
        if (categoryName){
        try {
          setIsLoading(true)
          // send the full payload expected by your API
          await axios.patch(`/api/categories/${categoryId}`, {
            name: categoryName,
            iconUrl: iconUrl
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
  <div className="rounded-lg border bg-white shadow-sm">

    {/* Header */}
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h4 className="text-sm font-medium">Edit Category</h4>
      <PopoverClose onClick={()=> setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
        Close
      </PopoverClose>
    </div>

    {/* Body */}
    <div className="p-4 space-y-4">
      <Input
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        placeholder="Category name"
      />

      {/* Image section */}
      <div className="space-y-2">
        {!isEditing && (
          !oldIconUrl ? (
            <div className="flex items-center justify-center h-32 rounded-md bg-slate-100">
              <ImageIcon className="h-8 w-8 text-slate-400" />
            </div>
          ) : (
            <div className="relative aspect-video rounded-md overflow-hidden">
              <Image
                alt="Category icon"
                fill
                className="object-cover"
                src={oldIconUrl}
              />
            </div>
          )
        )}

        {isEditing && (
          <div className="space-y-2">
            <FileUpload
              endpoint="categoryIcon"
              onChange={(url) => {
                if (url) setIconUrl(url)
              }}
            />
            <p className="text-xs text-muted-foreground">
              16:9 aspect ratio recommended
            </p>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={toggleEditing}
        >
          {!isEditing && !oldIconUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Upload image
            </>
          )}
          {!isEditing && oldIconUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit image
            </>
          )}
          {isEditing && "Cancel"}
        </Button>
      </div>
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