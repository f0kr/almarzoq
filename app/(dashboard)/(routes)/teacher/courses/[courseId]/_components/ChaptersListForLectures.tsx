"use client"

import { Chapter } from "@prisma/client"
import { useEffect, useState } from "react"
import {DragDropContext, Droppable, Draggable, DropResult} from "@hello-pangea/dnd"
import { cn } from "@/lib/utils"
import { Grip, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ChaptersListProps {
    items: Chapter[],
    onReorder: (updateData: {id: string, position: number}[]) => void
    onEdit: (id:string) => void
}

export const ChaptersListForLectures = ({
    items,
    onReorder,
    onEdit
}: ChaptersListProps) => {

    const [isMounted, setIsMounted] = useState(false)
    const [chapters, setChapters] = useState(items)

    useEffect(()=> {
        setIsMounted(true)
    }, [])

    useEffect(()=> {
        setChapters(items)
    }, [items])

    const onDragEnd = (result: DropResult) => {
        if(!result.destination) {
            return
        }

        const items = Array.from(chapters)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        const startIndex = Math.min(result.source.index, result.destination.index)
        const endIndex = Math.max(result.source.index, result.destination.index)

        const updatedChapters = items.slice(startIndex, endIndex + 1)

        setChapters(items)

        const bulkUpdatedData = updatedChapters.map((chapter)=> ({
            id: chapter.id,
            position: items.findIndex((item)=> item.id === chapter.id)
        }))

        onReorder(bulkUpdatedData)
    }

    if(!isMounted) {
        return null
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="chapters">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {chapters.map((chapter, index)=> (
                            <Draggable key={chapter.id} 
                                       draggableId={chapter.id}
                                        index={index}
                            >
                                {(provided)=> (
                                    <div
                                    className={cn("flex items-center gap-x-2 bg-paper border-beige border text-foreground rounded-lg mb-2 text-sm",
                                        chapter.isPublished && "bg-sage-pale/60 border-sage/30"
                                    )}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    >
                                        <div className={cn("px-2 py-3 border-r border-r-beige text-grey/60 hover:bg-beige rounded-l-lg transition",
                                            chapter.isPublished && "border-r-sage/30 hover:bg-sage-pale"
                                        )}
                                            {...provided.dragHandleProps}
                                        >
                                            <Grip className="h-5 w-5" />
                                        </div>
                                           {chapter.title}
                                           <div className="ml-auto pr-2 flex items-center gap-x-2">
                                            {chapter.isFree && (
                                                <Badge variant="sage">
                                                    Free
                                                </Badge>
                                            )}

                                            <Badge
                                            variant={chapter.isPublished ? "sage" : "level"}
                                            >
                                            
                                               {chapter.isPublished ? "Published" : "Draft"}

                                            </Badge>
                                            <Pencil
                                            onClick={()=> onEdit(chapter.id)}
                                            className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                                            />
                                           </div>
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}