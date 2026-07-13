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

type GroupRow = {
  id: string
  name: string
  url: string
  isMember: boolean
}

type GroupOption = {
  id: string
  name: string
}

export function StudentGroupsClient({
  groups,
  groupOptions,
  onAdd,
  onRemove,
  onMove,
}: {
  groups: GroupRow[]
  groupOptions: GroupOption[]
  onAdd: (groupId: string) => Promise<void>
  onRemove: (groupId: string) => Promise<void>
  onMove: (input: { fromGroupId: string; toGroupId: string }) => Promise<void>
}) {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const [query, setQuery] = React.useState("")

  const [moveOpen, setMoveOpen] = React.useState(false)
  const [moveFrom, setMoveFrom] = React.useState<GroupRow | null>(null)
  const [toGroupId, setToGroupId] = React.useState("")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups

    return groups.filter((g) => {
      return g.name.toLowerCase().includes(q) || g.url.toLowerCase().includes(q)
    })
  }, [groups, query])

  const openMove = (group: GroupRow) => {
    const destinations = groupOptions.filter((g) => g.id !== group.id)
    if (destinations.length === 0) return

    setMoveFrom(group)
    setToGroupId(destinations[0]?.id ?? "")
    setMoveOpen(true)
  }

  const closeMove = () => {
    setMoveOpen(false)
    setMoveFrom(null)
    setToGroupId("")
  }

  const handleAdd = (groupId: string) => {
    startTransition(async () => {
      try {
        await onAdd(groupId)
        toast.success("Student added")
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  const handleRemove = (groupId: string) => {
    startTransition(async () => {
      try {
        await onRemove(groupId)
        toast.success("Student removed")
        router.refresh()
      } catch (error) {
        console.log(error)
        toast.error("Something went wrong")
      }
    })
  }

  const handleMove = () => {
    if (!moveFrom || toGroupId.trim() === "" || toGroupId === moveFrom.id) return

    startTransition(async () => {
      try {
        await onMove({ fromGroupId: moveFrom.id, toGroupId })
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
          placeholder="Search groups..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {groups.length} group{groups.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No groups.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell className="max-w-[340px] truncate">{g.url}</TableCell>
                  <TableCell>
                    <Badge variant={g.isMember ? "sage" : "level"}>
                      {g.isMember ? "Member" : "Not added"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      {!g.isMember ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleAdd(g.id)}
                        >
                          Add
                        </Button>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={
                              isPending ||
                              groupOptions.filter((opt) => opt.id !== g.id).length === 0
                            }
                            onClick={() => openMove(g)}
                          >
                            Move
                          </Button>
                          <ConfirmModal onConfirm={() => handleRemove(g.id)}>
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
            <DialogDescription>{moveFrom?.name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm font-medium">Destination group</div>
            <Select value={toGroupId} onValueChange={setToGroupId} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groupOptions
                  .filter((g) => g.id !== moveFrom?.id)
                  .map((g) => (
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
              disabled={isPending || !moveFrom || toGroupId.trim() === "" || toGroupId === moveFrom.id}
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
