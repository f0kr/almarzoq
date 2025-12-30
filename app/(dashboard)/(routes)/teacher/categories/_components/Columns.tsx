"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu } from "@/components/ui/dropdown-menu"
import { Category } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { CategoryDelete } from "./CategoryDelete"
import CategoryEdit from "./CategoryEdit"

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
        const {id, name, iconUrl} = row.original

        return(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="flex justify-center space-x-2 p-2">
                    <CategoryEdit
                    name= {name}
                    oldIconUrl= {iconUrl}
                    categoryId={id}
                    />
                    <CategoryDelete
                        categoryId={id}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }
  }
]