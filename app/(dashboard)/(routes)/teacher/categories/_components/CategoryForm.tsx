"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import FileUpload from "@/components/FileUpload"

interface CategoryFormProps {
  initialData: {
    name: string
    iconUrl: string
  }
}

const formSchema = z.object({
  categoryName: z.string().min(2, "Name must be at least 2 characters"),
  iconUrl: z.string().url().nullable()
})

export default function CategoryForm({
  initialData
}: CategoryFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((prev) => !prev)

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
      await axios.post(`/api/categories/`, {
        categoryName: values.categoryName,
        iconUrl: values.iconUrl
      })
      toast.success("Category added")
      toggleEditing()
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong.")
      console.log(error)
    }
  }

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4 md:w-[50%] w-[70%]">
      <div className="font-medium flex items-center justify-between">
        Category Name
        <Button onClick={toggleEditing} variant="ghost">
          {isEditing ? (
            "Cancel"
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit category
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.name && "text-slate-500 italic"
          )}
        >
          {initialData.name ? initialData.name : "No category name"}
        </p>
      )}

      {isEditing && (
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
                setIsEditing(true)
                // re-run validation for categoryName (in case it already has a valid value)
                form.trigger("categoryName")
                toast.success("Icon uploaded — please enter a name and click Save")
              }}
            />
            <div className="text-xs text-muted-foreground mt-4">16:9 aspect ratio recommended</div>
          </div>
        </Form>
      )}
    </div>
  )
}
