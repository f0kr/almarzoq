"use client"

import * as z from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { ImageIcon, Pencil, PlusCircle, VideoIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Chapter, Course, MuxData } from '@prisma/client'
import MuxPlayer from "@mux/mux-player-react"
import FileUpload from '@/components/FileUpload'

interface ChapterVideoFormProps {
    initialData: Chapter & {muxData?: MuxData | null}
    courseId: string
    chapterId: string
}

const formSchema = z.object({
    videoUrl: z.string().min(1)
})


export default function ChapterVideoForm({
    initialData,
    courseId,
    chapterId
}: ChapterVideoFormProps) {

    const [isEditing, setIsEditing] = useState(false)

    const toggleEditing = () => {
        setIsEditing((prev) => !prev)
    }

    const router = useRouter()


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, values)
            toast.success('Chapter updated.')
            toggleEditing()
            router.refresh()
            
        }catch (error) {
            toast.error('Something went wrong.')
            console.log(error)
        }
    }

    return(
        <div className='mt-6 border bg-slate-100 rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
              Chapter video
              <Button
              onClick={toggleEditing}
              variant="ghost">
                {isEditing && (
                    <>Cancel</>
                )}
                {!isEditing && !initialData.videoUrl &&(
                    <>
                    <PlusCircle className='h-4 w-4 mr-2'/>
                    Add a video
                    </>
                )}
                {!isEditing && initialData.videoUrl && (
                    <>
                    <Pencil className='h-4 w-4 mr-2'/>
                    Edit video
                    </>
                )}
              </Button>
            </div>
            {!isEditing && (
                !initialData.videoUrl ? (
                    <div className='flex items-center rounded-md justify-center h-60 bg-slate-200 '>
                        <VideoIcon className='h-10 w-10 text-slate-500 '/>
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2'>
                        <MuxPlayer
                        playbackId={initialData?.muxData?.playbackId || ''}
                        />
                    </div>
                )
            )}
            {isEditing && (
                <div>
                    <FileUpload
                    endpoint='chapterVideo'
                    onChange={(url) => {
                        if (url) {
                            onSubmit({videoUrl: url})
                        }
                    }}
                    />
                    <div className='text-xs text-muted-foreground mt-4'>
                        Upload this chapter&apos;s video
                    </div>
                </div>
            )}
            {initialData.videoUrl && !isEditing && (
                <div className='text-xs text-muted-foreground mt-2'>
                    Videos can take a few minutes to process. Refresh the page if the video does not appear.
                </div>
            )}
        </div>
    )
}