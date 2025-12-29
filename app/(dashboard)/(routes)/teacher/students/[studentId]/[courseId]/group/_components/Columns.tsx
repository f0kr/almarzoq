"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import axios from "axios"
import { ArrowUpDown, Edit } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

export type Group = {
  id: string
  name: string | null
  url: string
  courseId: string
  studentIds: string[]
  createdAt: Date
}

export const columns: ColumnDef<Group>[] = [
  {
    accessorKey: "name",
    header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
             Name
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
      cell: ({ row }) => {
    const name = row.getValue("name") as string | null
    return <span>{name && name.trim() !== "" ? name : "unknown"}</span>
  },
  },
  {
    accessorKey: "url",
        header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
             Url
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
  },
  {
    id: "actions",
    cell: ({row})=> {

        const group = row.original
 
        const router = useRouter()
        const params = useParams()
        const targetStudentId = params.studentId as string

        const handleAdd = async (e: React.MouseEvent) => {
          e.preventDefault()
          try {
            await axios.post(
              `/api/courses/${group.courseId}/groupURL/${group.id}/add-user`,
              { targetUserId: targetStudentId },
              { headers: { "Content-Type": "application/json" } }
            )
            // use router passed from caller to refresh
            router.push('/teacher/students')
          } catch (err) {
            console.error("Add student to group error:", err)
          }
        }
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAdd}>
              Add student
            </Button>
          </div>
        )
    }
  },
]