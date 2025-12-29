"use client"

import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Form, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import z from "zod"

interface CategoryFormProps {
  initialData: {
    name: string
    iconUrl: string
  },
  categoryId: string
}

const formSchema = z.object({
  categoryName: z.string().min(2, "Name must be at least 2 characters"),
  iconUrl: z.string().url().nullable()
})

export default function CategoryEdit({
    initialData, categoryId
}: CategoryFormProps)
{

      const router = useRouter()
    
      const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          categoryName: initialData.name ?? "",
          iconUrl: initialData.iconUrl ?? null
        }
      })
    
      const { isSubmitting, isValid } = form.formState
    
      const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
          // send the full payload expected by your API
          await axios.patch(`/api/categories/${categoryId}`, {
            categoryName: values.categoryName,
            iconUrl: values.iconUrl
          })
          toast.success("Category edited")
          router.refresh()
        } catch (error) {
          toast.error("Something went wrong.")
          console.log(error)
        }
      }
    return (
        <DropdownMenuItem asChild>
            <Popover>
                <PopoverTrigger asChild>
                    <Pencil className="h-4 w-4 mr-2"/>
                </PopoverTrigger>
                <PopoverContent forceMount>
                            <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} placeholder="Enter category name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>

          <div>
            <FileUpload
              endpoint="categoryIcon"
              onChange={(url) => {
                if (!url) return
                // set the uploaded URL in the form but DO NOT auto-submit
                form.setValue("iconUrl", url)
                // open editor so user can enter name and click Save
                // re-run validation for categoryName (in case it already has a valid value)
                form.trigger("categoryName")
                toast.success("Icon uploaded")
              }}
            />
            <div className="text-xs text-muted-foreground mt-4">16:9 aspect ratio recommended</div>
          </div>
        </Form>
                </PopoverContent>
            </Popover>
        </DropdownMenuItem>
    )
}