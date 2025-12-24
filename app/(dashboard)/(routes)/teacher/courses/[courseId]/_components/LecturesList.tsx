"use client"

import { Chapter, Course, Lecture } from "@prisma/client"
import { useEffect, useState } from "react"
import {DragDropContext, Droppable, Draggable, DropResult} from "@hello-pangea/dnd"
import { Delete, Grip, Pencil, Trash, Check, X } from "lucide-react"
import ChaptersFormForLectures from "./ChaptersFormForLectures"
import { ConfirmModal } from "@/components/modals/ConfirmModal"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface LecturesListProps {
    initialData: Course & {chapters: Chapter[]}
    items: Lecture[],
    onReorder: (updateData: {id: string, position: number}[]) => void
    courseId: string
}

export const LecturesList = ({
    initialData,
    items,
    onReorder,
    courseId
}: LecturesListProps) => {

    const [isMounted, setIsMounted] = useState(false)
    const [lectures, setLectures] = useState(items)
    const [isLoading, setIsLoading] = useState(false)
    const [editingLectureId, setEditingLectureId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState<string>("")
    const [updatingMap, setUpdatingMap] = useState<Record<string, boolean>>({})
    const router = useRouter()

    const toggleEditing = (id?: string, title?: string) => {
        if (!id) {
            setEditingLectureId(null)
            setEditTitle("")
            return
        }

        if (editingLectureId === id) {
            setEditingLectureId(null)
            setEditTitle("")
        } else {
            setEditingLectureId(id)
            setEditTitle(title ?? "")
        }
    }


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

    const onDelete = async (id:string) => {
        try {
            setIsLoading(true)
            await axios.delete(`/api/courses/${courseId}/lectures/${id}`)
            toast.success('Lecture deleted successfully.')
            router.refresh()
        }catch (error) {
            toast.error('Something went wrong while deleting the lecture.')
            console.log(error)
        }finally {
            setIsLoading(false)
        }
    }
    const onRename = async (id: string) => {
        try {
            setUpdatingMap((m) => ({ ...m, [id]: true }))
            await axios.patch(`/api/courses/${courseId}/lectures/${id}`, { title: editTitle })
            toast.success('Lecture title updated.')
            setEditingLectureId(null)
            setEditTitle("")
            router.refresh()
        } catch (error) {
            toast.error('Something went wrong while updating the lecture title.')
            console.log(error)
        } finally {
            setUpdatingMap((m) => ({ ...m, [id]: false }))
        }
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
                                           {editingLectureId !== lecture.id && (
                                               <span className="truncate">{lecture.title}</span>
                                           )}
                                           <div className="ml-auto pr-2 flex items-center gap-x-2">

                                            <div className="flex items-center gap-x-2">
                                                {editingLectureId === lecture.id ? (
                                                    <div className="flex items-center gap-x-2">
                                                        <input
                                                            className="border rounded px-2 py-1 text-sm w-56 bg-white focus:ring-2 focus:ring-sky-400 outline-none"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            placeholder="Lecture title"
                                                            aria-label="Edit lecture title"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => onRename(lecture.id)}
                                                            disabled={!editTitle.trim() || updatingMap[lecture.id]}
                                                            variant="ghost"
                                                        >
                                                            {updatingMap[lecture.id] ? (
                                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                                                            ) : (
                                                                <Check className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => toggleEditing()}
                                                            variant="ghost"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() => toggleEditing(lecture.id, lecture.title)}
                                                        variant="ghost"
                                                    >
                                                        <Pencil className='h-4 w-4 mr-0'/>
                                                    </Button>
                                                )}
                                            </div>

                                            <ConfirmModal onConfirm={()=> onDelete(lecture.id)}>
                                                <Button
                                                    size="sm"
                                                    disabled={isLoading}
                                                >
                                                <Trash className="h-4 w-4" />
                                                </Button>
                                            </ConfirmModal>
                                           
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