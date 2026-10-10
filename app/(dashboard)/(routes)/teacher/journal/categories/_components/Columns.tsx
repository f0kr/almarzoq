"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JournalCategory } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { JournalCategoryDelete } from "./JournalCategoryDelete"
import JournalCategoryEdit from "./JournalCategoryEdit"

export type JournalCategoryRow = JournalCategory & { articleCount: number }

export const columns: ColumnDef<JournalCategoryRow>[] = [
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
  },
  {
    accessorKey: "nameAr",
    header: "Arabic",
    cell: ({ row }) => {
      const { nameAr } = row.original
      return nameAr ? (
        <span dir="rtl" lang="ar">
          {nameAr}
        </span>
      ) : (
        <span className="text-muted-foreground italic">not set</span>
      )
    },
  },
  {
    accessorKey: "articleCount",
    header: "Articles",
    cell: ({ row }) => row.original.articleCount,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="sage">Offered</Badge>
      ) : (
        <Badge variant="category">Hidden</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { id, name, nameAr, isActive } = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-4 w-4">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="flex justify-center space-x-2 p-2">
            <JournalCategoryEdit
              categoryId={id}
              name={name}
              nameAr={nameAr}
              isActive={isActive}
            />
            <JournalCategoryDelete categoryId={id} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
