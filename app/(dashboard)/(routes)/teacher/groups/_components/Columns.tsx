"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import toast from "react-hot-toast"

import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash, Users } from "lucide-react"

export type GroupRow = {
  id: string
  name: string | null
  url: string
  courseId: string
  courseTitle: string
  studentIds: string[]
  createdAt: string
}

export type GroupsTableMeta = {
  onDelete: (id: string) => Promise<void>
  onUpdate: (input: { id: string; name: string; url: string }) => Promise<void>
}

function GroupActions({ group, meta }: { group: GroupRow; meta: GroupsTableMeta }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState(group.name ?? "")
  const [url, setUrl] = useState(group.url)

  const onDelete = () => {
    startTransition(async () => {
      try {
        await meta.onDelete(group.id)
        toast.success("Group deleted")
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  const onSave = () => {
    startTransition(async () => {
      try {
        await meta.onUpdate({
          id: group.id,
          name,
          url,
        })
        toast.success("Group updated")
        setOpen(false)
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  return (
    <div className="flex items-center justify-end">
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                router.push(`/teacher/groups/${group.id}`)
              }}
            >
              <Users className="h-4 w-4" />
              Students
            </DropdownMenuItem>
            <ConfirmModal onConfirm={onDelete}>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </ConfirmModal>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>{group.courseTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Name</div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                placeholder="Group name"
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
              disabled={isPending || url.trim() === ""}
              type="button"
              onClick={onSave}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const columns: ColumnDef<GroupRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null
      return <span>{name && name.trim() !== "" ? name : "unknown"}</span>
    },
  },
  {
    accessorKey: "url",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Url
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "courseTitle",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Course
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "studentIds",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Student Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const studentIds = row.getValue("studentIds") || []
      const count = Array.isArray(studentIds) ? studentIds.length : 0

      return (
        <Badge className={cn("bg-slate-500", count > 0 && "bg-green-700")}>
          {count}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const group = row.original
      const meta = table.options.meta as GroupsTableMeta | undefined

      if (!meta) return null

      return <GroupActions group={group} meta={meta} />
    },
  },
]
