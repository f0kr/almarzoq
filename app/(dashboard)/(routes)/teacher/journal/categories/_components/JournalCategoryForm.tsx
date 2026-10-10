"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameAr: z.string().optional(),
})

export default function JournalCategoryForm() {
  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((prev) => !prev)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", nameAr: "" },
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.post("/api/journal/categories", {
        name: values.name,
        nameAr: values.nameAr,
      })
      toast.success("Category added")
      form.reset({ name: "", nameAr: "" })
      toggleEditing()
      router.refresh()
    } catch (error) {
      // The API answers 409 with a readable sentence; show it rather than
      // the usual catch-all.
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Something went wrong."
      toast.error(message)
      console.log(error)
    }
  }

  return (
    <div className="mt-6 border border-beige bg-card rounded-2xl p-4 md:w-[50%] w-[70%]">
      <div className="font-medium flex items-center justify-between">
        Journal categories
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
        <p className="text-sm mt-2 text-muted-foreground">
          Writers pick one of these, or &quot;Other&quot; and propose their own.
        </p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (English)</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. Technique"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nameAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arabic name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      dir="rtl"
                      lang="ar"
                      disabled={isSubmitting}
                      placeholder="مثال: التقنيات"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown to readers in the journal when set; the English name is
                    used everywhere in this dashboard.
                  </FormDescription>
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
