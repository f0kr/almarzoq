"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle } from "lucide-react"

import { columns, GroupRow } from "./Columns"
import { DataTable } from "./DataTable"

type CourseOption = {
  id: string
  title: string
}

export function GroupsClient({
  courses,
  groups,
  onCreate,
  onUpdate,
  onDelete,
}: {
  courses: CourseOption[]
  groups: GroupRow[]
  onCreate: (input: { courseId: string; name: string; url: string }) => Promise<void>
  onUpdate: (input: { id: string; name: string; url: string }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "")
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")

  const onSubmit = () => {
    startTransition(async () => {
      try {
        await onCreate({
          courseId,
          name,
          url,
        })
        toast.success("Group created")
        setOpen(false)
        setName("")
        setUrl("")
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">Groups</div>
          <div className="text-sm text-muted-foreground">
            Create, edit, and delete your course groups.
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={courses.length === 0}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create group</DialogTitle>
              <DialogDescription>
                Choose the course and add the group URL.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Course</div>
                <Select value={courseId} onValueChange={setCourseId} disabled={isPending}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Name</div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  placeholder="Group name (optional)"
                />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">URL</div>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                disabled={isPending}
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending || courseId.trim() === "" || url.trim() === ""}
                type="button"
                onClick={onSubmit}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={groups}
        meta={{
          onDelete,
          onUpdate,
        }}
      />
    </div>
  )
}

