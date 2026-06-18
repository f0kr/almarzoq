"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type StudentRow = {
  id: string
  fullName: string | null
  email: string
  inGroup: boolean
}

type GroupOption = {
  id: string
  name: string
}

export function GroupStudentsClient({
  groupId,
  students,
  otherGroups,
  onAdd,
  onRemove,
  onMove,
}: {
  groupId: string
  students: StudentRow[]
  otherGroups: GroupOption[]
  onAdd: (studentId: string) => Promise<void>
  onRemove: (studentId: string) => Promise<void>
  onMove: (input: { studentId: string; toGroupId: string }) => Promise<void>
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<"all" | "inGroup" | "notInGroup">("all")
  const [moveOpen, setMoveOpen] = React.useState(false)
  const [moveStudent, setMoveStudent] = React.useState<StudentRow | null>(null)
  const [toGroupId, setToGroupId] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return students.filter((s) => {
      const name = (s.fullName ?? "").toLowerCase()
      const email = (s.email ?? "").toLowerCase()
      const matchesQuery =
        q === "" ||
        name.includes(q) ||
        email.includes(q) ||
        s.id.toLowerCase().includes(q)

      const matchesFilter =
        filter === "all" ||
        (filter === "inGroup" && s.inGroup) ||
        (filter === "notInGroup" && !s.inGroup)

      return matchesQuery && matchesFilter
    })
  }, [query, filter, students])

  const openMove = (student: StudentRow) => {
    if (otherGroups.length === 0) return
    setMoveStudent(student)
    setToGroupId(otherGroups[0]?.id ?? "")
    setMoveOpen(true)
  }

  const closeMove = () => {
    setMoveOpen(false)
    setMoveStudent(null)
    setToGroupId("")
  }

  const handleRemove = (student: StudentRow) => {
    startTransition(async () => {
      try {
        await onRemove(student.id)
        toast.success("Student removed")
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  const handleAdd = (student: StudentRow) => {
    startTransition(async () => {
      try {
        await onAdd(student.id)
        toast.success("Student added")
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  const handleMove = () => {
    if (!moveStudent || toGroupId.trim() === "" || toGroupId === groupId) return

    startTransition(async () => {
      try {
        await onMove({ studentId: moveStudent.id, toGroupId })
        toast.success("Student moved")
        closeMove()
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={(value) => setFilter(value as "all" | "inGroup" | "notInGroup")}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All students</SelectItem>
              <SelectItem value="inGroup">In group</SelectItem>
              <SelectItem value="notInGroup">Not in group</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length} of {students.length} students
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No students.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {s.fullName && s.fullName.trim() !== "" ? s.fullName : "Unknown"}
                  </TableCell>
                  <TableCell>{s.email && s.email.trim() !== "" ? s.email : "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={s.inGroup ? "bg-green-700" : "bg-slate-500"}
                    >
                      {s.inGroup ? "In group" : "Not added"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      {!s.inGroup ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleAdd(s)}
                        >
                          Add
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending || otherGroups.length === 0}
                            onClick={() => openMove(s)}
                          >
                            Move
                          </Button>
                          <ConfirmModal onConfirm={() => handleRemove(s)}>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              disabled={isPending}
                            >
                              Remove
                            </Button>
                          </ConfirmModal>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={moveOpen} onOpenChange={(open) => (open ? setMoveOpen(true) : closeMove())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move student</DialogTitle>
            <DialogDescription>
              {moveStudent?.fullName && moveStudent.fullName.trim() !== ""
                ? moveStudent.fullName
                : moveStudent?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm font-medium">Destination group</div>
            <Select value={toGroupId} onValueChange={setToGroupId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {otherGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={closeMove}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                isPending ||
                !moveStudent ||
                toGroupId.trim() === "" ||
                toGroupId === groupId
              }
              onClick={handleMove}
            >
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

