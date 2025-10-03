"use client"

import { Chapter, Course, Lecture } from "@prisma/client"
import { useEffect, useState } from "react"
import {DragDropContext, Droppable, Draggable, DropResult} from "@hello-pangea/dnd"
import { Delete, Grip, Pencil } from "lucide-react"
import ChaptersFormForLectures from "./ChaptersFormForLectures"

interface LecturesListProps {
    initialData: Course & {chapters: Chapter[]}
    items: Lecture[],
    onReorder: (updateData: {id: string, position: number}[]) => void
    onDelete: (id:string) => void
    courseId: string
}

export const LecturesList = ({
    initialData,
    items,
    onReorder,
    onDelete,
    courseId
}: LecturesListProps) => {

    const [isMounted, setIsMounted] = useState(false)
    const [lectures, setLectures] = useState(items)

    useEffect(()=> {
        setIsMounted(true)
    }, [])

    useEffect(()=> {
        setLectures(items)
    }, [items])

    const onDragEnd = (result: DropResult) => {
        if(!result.destination) {
            return
        }

        const items = Array.from(lectures)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        const startIndex = Math.min(result.source.index, result.destination.index)
        const endIndex = Math.max(result.source.index, result.destination.index)

        const updatedLectures = items.slice(startIndex, endIndex + 1)

        setLectures(items)

        const bulkUpdatedData = updatedLectures.map((lecture)=> ({
            id: lecture.id,
            position: items.findIndex((item)=> item.id === lecture.id)
        }))

        onReorder(bulkUpdatedData)
    }

    if(!isMounted) {
        return null
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lectures">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        {lectures.map((lecture, index)=> (
                            <Draggable key={lecture.id} 
                                       draggableId={lecture.id}
                                        index={index}
                            >
                                {(provided)=> (
                                    <div
                                    className="flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm"
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    >
                                        <div className="px-2 py-3 border-2 border-r-slate-200 hover:bg-slate-300 rounded-l-md transition"
                                            {...provided.dragHandleProps}
                                        >
                                            <Grip className="h-5 w-5" />
                                        </div>
                                           {lecture.title}
                                           <div className="ml-auto pr-2 flex items-center gap-x-2">
                
                                            <Pencil
                                            className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                                            />

                                            <Delete
                                           onClick={()=> onDelete(lecture.id)}
                                           className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                                           />
                                           
                                           </div>
                                           <div className="pl-8">
                                            <ChaptersFormForLectures
                                            initialData={{
                                                ...initialData,
                                                chapters: initialData.chapters.filter(chapter => chapter.lectureId === lecture.id)
                                            }}
                                            lectureId={lecture.id}
                                            courseId={courseId}
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