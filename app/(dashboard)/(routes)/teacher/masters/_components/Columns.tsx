"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenuContent, DropdownMenuTrigger, DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Teacher } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown,Edit, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MasterDelete } from "./MasterDelete"
import { cn } from "@/lib/utils"


export const columns: ColumnDef<Teacher>[] = [
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
    cell: ({row})=> {
        const { name, profileUrl } = row.original

        return (
            <div className="flex items-center gap-3">
                <Image
                    src={profileUrl || "/icons/default-avatar.png"}
                    alt={name || "Master Avatar"}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    unoptimized
                />
                <span className="truncate">{name}</span>
            </div>
        )
    },
  },
  {
    accessorKey: "title",
    header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
             Title
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
  },
  {
    accessorKey: "bio",
    header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
             Bio
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
    cell: ({row}) => {
        const raw = row.original.bio ?? ""
        const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
        const text = stripHtml(raw)
        const truncated = text.length > 100 ? text.slice(0, 100).trim() + "…" : text

        return <span className="max-w-[320px] block truncate">{truncated}</span>
    },
  },
  {
    accessorKey: "isPublished",
        header: ({column})=> {
        return(
            <Button
            variant="ghost"
            onClick={()=> column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Published
             <ArrowUpDown className="ml-2 h-4 w-4"/>
            </Button>
        )
    },
    cell: ({row})=> {
        const isPublished = row.getValue("isPublished") || false

        return(
            <Badge className={cn(
                "bg-slate-500",
                isPublished && "bg-sky-700"
            )}>
                {isPublished? "Published" : "Draft"}
            </Badge>
        )
    }
  },
  {
    id: "actions",
    cell: ({row})=> {
        const {id} = row.original
        const router = useRouter()

        return(
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-4 w-4">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4"/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                    <div className="px-2 py-1">
                        <MasterDelete
                            masterId={id}
                        />
                    </div>
                    <DropdownMenuItem
                        className="flex items-center gap-2 px-2 py-2"
                        onSelect={() => router.push(`/teacher/masters/${id}`)}
                    >
                        <Edit className="h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    },
  }
]