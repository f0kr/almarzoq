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
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface CategoryFormProps {
  initialData: {
    name: string
  }
}

const formSchema = z.object({
  categoryName: z.string().min(2, "Name must be at least 2 characters"),
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
    }
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // send the full payload expected by your API
      await axios.post(`/api/categories/`, {
        categoryName: values.categoryName,
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
    <div className="mt-6 border bg-muted rounded-md p-4 md:w-[50%] w-[70%]">
      <div className="font-medium flex items-center justify-between">
        Category Name
        <Button onClick={toggleEditing} variant="ghost">
          {isEditing ? (
            "Cancel"
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a category
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.name && "text-muted-foreground italic"
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
        </Form>
      )}
    </div>
  )
}
