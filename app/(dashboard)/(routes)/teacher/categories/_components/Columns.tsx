"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Category } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react"
import Link from "next/link"
import { CategoryDelete } from "./CategoryDelete"

export const columns: ColumnDef<Category>[] = [
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
  },
  {
    id: "actions",
    cell: ({row})=> {
        const {id} = row.original

        return(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <CategoryDelete
                        categoryId={id}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
]