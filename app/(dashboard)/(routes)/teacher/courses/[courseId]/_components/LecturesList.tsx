"use client"

import { Chapter, Course, Lecture } from "@prisma/client"
import { useEffect, useState } from "react"
import {DragDropContext, Droppable, Draggable, DropResult} from "@hello-pangea/dnd"
import { Grip, Pencil, Trash, Check, X } from "lucide-react"
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
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-4"
        >
          {lectures.map((lecture, index) => (
            <Draggable
              key={lecture.id}
              draggableId={lecture.id}
              index={index}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="
                    rounded-lg
                    border
                    bg-white
                    shadow-sm
                    transition
                    hover:shadow-md
                  "
                >
                  {/* ===== Lecture Row ===== */}
                  <div className="flex items-center gap-3 px-3 py-3">
                    {/* Drag Handle */}
                    <div
                      {...provided.dragHandleProps}
                      className="
                        flex items-center justify-center
                        rounded-md
                        p-2
                        text-muted-foreground
                        hover:bg-muted
                        cursor-grab
                      "
                    >
                      <Grip className="h-5 w-5" />
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      {editingLectureId !== lecture.id ? (
                        <p className="text-sm font-medium text-foreground truncate">
                          {lecture.title}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Lecture title"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onRename(lecture.id)}
                            disabled={!editTitle.trim() || updatingMap[lecture.id]}
                          >
                            {updatingMap[lecture.id] ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                              </svg>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleEditing()}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {editingLectureId !== lecture.id && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          toggleEditing(lecture.id, lecture.title)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    <ConfirmModal
                      onConfirm={() => onDelete(lecture.id)}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isLoading}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </ConfirmModal>
                  </div>

                  {/* ===== Chapters Section ===== */}
                  <div className="border-t bg-muted px-4 py-3">
                    <ChaptersFormForLectures
                      initialData={{
                        ...initialData,
                        chapters: initialData.chapters.filter(
                          (chapter) =>
                            chapter.lectureId === lecture.id
                        ),
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