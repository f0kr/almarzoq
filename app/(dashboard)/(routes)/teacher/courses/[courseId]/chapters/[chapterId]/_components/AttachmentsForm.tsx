"use client"

import * as z from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { File,Loader2, PlusCircle, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Attachment, Chapter, MuxData } from '@prisma/client'
import FileUpload from '@/components/FileUpload'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'


interface AttachmentsFormProps {
    initialData: Chapter & {attachments: Attachment[]} & {muxData?: MuxData | null},
    courseId: string,
    lectureId: string,
    chapterId: string
}

const formSchema = z.object({
   url: z.string().min(1),
   name: z.string().optional(),
   key: z.string().optional()
})


export default function AttachmentsForm({
    initialData,
    courseId,
    lectureId,
    chapterId
}: AttachmentsFormProps) {

    const [isEditing, setIsEditing] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const toggleEditing = () => {
        setIsEditing((prev) => !prev)
    }

    const router = useRouter()


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            await axios.post(`/api/courses/${courseId}/lectures/${lectureId}/chapters/${chapterId}/attachments`, values)
            toast.success('Course updated.')
            toggleEditing()
            router.refresh()
            
        }catch (error) {
            toast.error('Something went wrong.')
            console.log(error)
        }
    }

    const onDelete = async (id: string) => {
        try {
            setDeletingId(id)
            await axios.delete(`/api/courses/${courseId}/lectures/${lectureId}/chapters/${chapterId}/attachments/${id}`)
            toast.success('Attachment deleted.')
            router.refresh()
        }catch {
            toast.error('Something went wrong.')
        } finally {
            setDeletingId(null)
        }
    }

    const onCheckedChange = async (id: string, isFree: boolean) => {
        try {
            setIsUpdating(true)
            await axios.patch(`/api/courses/${courseId}/lectures/${lectureId}/chapters/${chapterId}/attachments/${id}`, { isFree })
            router.refresh()
        } catch(err) {
            toast.error('Something went wrong.')
            console.log(err)
        } finally {
            setIsUpdating(false)
        }
    }

    return(
        <div className='mt-6 border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
              Chapter Attachments
              <Button
              onClick={toggleEditing}
              variant="ghost">
                {isEditing && (
                    <>Cancel</>
                )}
                {!isEditing && (
                    <>
                    <PlusCircle className='h-4 w-4 mr-2'/>
                    Add File
                    </>
                )}
              </Button>
            </div>
            {!isEditing && (
                    <>
                    {initialData.attachments.length === 0 && (
                        <p className='text-sm text-slate-500 mt-2 italic'>  
                            No attachments added yet.
                        </p>
                    )}
                    {initialData.attachments.length > 0 && (
                        <div className='space-y-2'>
                            {initialData.attachments.map((attachment) => (
                                <div key={attachment.id}   className="
                                    flex items-center
                                    rounded-md border border-red-200
                                    bg-red-50
                                    px-3 py-2
                                    text-red-800
                                ">
                                    <File className='h-4 w-4 mr-2 flex-shrink-0'/>
                                    <p className='text-xs line-clamp-1 mr-auto'>
                                        {attachment.name}
                                    </p>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <span className={cn('text-xs font-medium text-red-700', !attachment.isFree && 'text-xs font-medium text-red-700')}>{attachment.isFree? "Free" : "Paid"}</span>
                                        <Checkbox
                                          disabled={isUpdating}
                                          checked={attachment.isFree}
                                          onCheckedChange={(checked) =>
                                            onCheckedChange(attachment.id, checked as boolean)
                                          }
                                        />
                                      </div>
                                    {deletingId === attachment.id && (
                                        <div>
                                            <Loader2 className='h-4 w-4 animate-spin'/>
                                        </div>
                                    )}
                                    {deletingId !== attachment.id && (
                                        <button onClick={()=> onDelete(attachment.id)} className='ml-2 hover:opacity-75 transition'>
                                            <X className='h-4 w-4'/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                )
            }
            {isEditing && (
                <div>
                    <FileUpload
                    endpoint='courseAttachment'
                    onChange={(url, name, key) => {
                        if (url) {
                            onSubmit({url: url, name: name, key: key})
                        }
                    }}
                    />
                    <div className='text-xs text-muted-foreground mt-4'>
                        Add anything your student might need to complete the course.
                    </div>
                </div>
            )}
        </div>
    )
}