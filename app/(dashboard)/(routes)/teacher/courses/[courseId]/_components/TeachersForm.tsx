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
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Pencil, Plus, ExternalLink } from "lucide-react"
import { useState, useMemo } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Input } from "@/components/ui/input"

interface TeachersFormProps {
  initialData: {
    teachers: { id: string; name: string; title: string | null }[]
  }
  courseId: string
  options: { label: string; value: string; title?: string }[]
}

const formSchema = z.object({
  teacherIds: z.array(z.string()).min(1, "Select at least one master."),
})

export default function TeachersForm({ initialData, courseId, options }: TeachersFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((prev) => !prev)

  const router = useRouter()

  const initialTeacherIds = useMemo(() => initialData.teachers.map((t) => t.id), [initialData.teachers])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherIds: initialTeacherIds,
    },
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values)
      toast.success("Masters updated.")
      toggleEditing()
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong.")
      console.log(error)
    }
  }

  const teacherIds = form.watch("teacherIds")

  const selectedLabels = useMemo(
    () => options.filter((option) => teacherIds?.includes(option.value)).map((option) => option.label),
    [options, teacherIds]
  )

  const [search, setSearch] = useState("")
  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        (option.title?.toLowerCase().includes(q) ?? false)
    )
  }, [options, search])

  return (
    <div className="mt-6 rounded-2xl border border-beige bg-card p-4">
      <div className="flex items-center justify-between font-medium">
        Masters
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
            <Link href="/teacher/masters">
              <Plus className="h-4 w-4" />
              Add master
            </Link>
          </Button>
          <Button onClick={toggleEditing} variant="ghost" size="sm">
            {isEditing ? (
              "Cancel"
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>

      {!isEditing && (
        <div className={cn("text-sm mt-2", selectedLabels.length === 0 && "text-muted-foreground italic")}>
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : "No masters assigned"}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <FormField
              control={form.control}
              name="teacherIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select masters</FormLabel>
                  <FormControl>
                    <div className="rounded-md border bg-white p-3 space-y-3">
                      <Input
                        placeholder="Search masters..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9"
                      />
                      <div className="max-h-64 overflow-auto space-y-2">
                        {filteredOptions.length === 0 && (
                          <p className="text-xs text-muted-foreground px-1">No master found.</p>
                        )}
                        {filteredOptions.map((option) => {
                          const isSelected = field.value?.includes(option.value)
                          return (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted"
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => {
                                  const nextValue = isSelected
                                    ? field.value.filter((v) => v !== option.value)
                                    : [...(field.value || []), option.value]
                                  field.onChange(nextValue)
                                }}
                                aria-label={`Select ${option.label}`}
                                className="mt-0.5 h-4 w-4"
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{option.label}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {option.title || "Title coming soon"}
                                </span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
              <Button variant="outline" asChild size="sm" className="gap-1">
                <Link href="/teacher/masters">
                  <ExternalLink className="h-4 w-4" />
                  Manage masters
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
