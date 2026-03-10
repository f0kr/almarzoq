"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

import { ConfirmModal } from "@/components/modals/ConfirmModal"
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
}

type GroupOption = {
  id: string
  name: string
}

export function GroupStudentsClient({
  groupId,
  students,
  otherGroups,
  onRemove,
  onMove,
}: {
  groupId: string
  students: StudentRow[]
  otherGroups: GroupOption[]
  onRemove: (studentId: string) => Promise<void>
  onMove: (input: { studentId: string; toGroupId: string }) => Promise<void>
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const [query, setQuery] = React.useState("")
  const [moveOpen, setMoveOpen] = React.useState(false)
  const [moveStudent, setMoveStudent] = React.useState<StudentRow | null>(null)
  const [toGroupId, setToGroupId] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return students

    return students.filter((s) => {
      const name = (s.fullName ?? "").toLowerCase()
      const email = (s.email ?? "").toLowerCase()
      return name.includes(q) || email.includes(q) || s.id.toLowerCase().includes(q)
    })
  }, [query, students])

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
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {students.length} student{students.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
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
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
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

