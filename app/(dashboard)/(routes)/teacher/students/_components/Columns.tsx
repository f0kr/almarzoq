"use client"

import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, GroupIcon } from "lucide-react"
import Link from "next/link"

export type Student = {
  id: string
  fullName: string | null
  email: string
  createdAt: number
}

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "fullName",
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
    const fullName = row.getValue("fullName") as string | null
    return <span>{fullName && fullName.trim() !== "" ? fullName : "unknown"}</span>
  },
  },
  {
    accessorKey: "email",
        header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
             Email
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
  },
  {
    accessorKey: "createdAt",
        header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
             Joined at
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
      cell: ({ row }) => {
    const createdAt = row.getValue("createdAt") as string
    const formatted = new Date(createdAt).toLocaleDateString("ar-IQ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

    return <span>{formatted}</span>
  },
  },
  
  {
    id: "actions",
    cell: ({row})=> {
        const {id} = row.original
        
        return(
          <Link href={`/teacher/students/${id}`}>
              <Edit className="h-4 w-4 mr-2"/>
                Edit
          </Link>
        )
    }
  },
]