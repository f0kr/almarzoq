"use client"

import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Chapter, Course, Lecture } from '@prisma/client'
import { ChaptersListForLectures } from './ChaptersListForLectures'

interface ChaptersFormProps {
    initialData: Course & { chapters: Chapter[]},
    lectureId: string
    courseId: string
}

const formSchema = z.object({
    title: z.string().min(1)
})


export default function ChaptersFormForLectures({
    initialData,
    lectureId,
    courseId
}: ChaptersFormProps) {

    const [isCreating, setIsCreating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const toggleCreating = () => {
        setIsCreating((prev) => !prev)
    }

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ""
        }
    })

    const {isSubmitting, isValid} = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            await axios.post(`/api/courses/${courseId}/lectures/${lectureId}/chapters`, values)
            toast.success('chapter created successfully.')
            toggleCreating()
            router.refresh()
            
        }catch (error) {
            toast.error('Something went wrong.')
            console.log(error)
        }
    }

    const onReorder = async (updateData: {id: string, position: number}[]) => {
        try {
            setIsUpdating(true)
            await axios.put(`/api/courses/${courseId}/lectures/${lectureId}/chapters/reorder`, {
                list: updateData
            })
            toast.success('Chapters reordered successfully.')
            router.refresh()
        }catch (error) {
            toast.error('Something went wrong while reordering chapters.')
            console.log(error)
        }finally {
            setIsUpdating(false)
        }
    }

    const onEdit = (id:string)=> {
        router.push(`/teacher/courses/${courseId}/chapters/${id}`)
    }

    return(
        <div className='relative mt-6 border border-beige bg-card rounded-2xl p-4'>
            {isUpdating && (
                <div className='absolute h-full w-full bg-foreground/10 top-0 right-0 rounded-m flex items-center justify-center'>
                    <Loader2 className='animate-spin h-6 w-6 text-primary'/>
                </div>
            )}
              <Button
              onClick={toggleCreating}
              variant="ghost">
                {isCreating && (
                    <>Cancel</>
                )}
                {!isCreating && (
                    <>
                    <PlusCircle className='h-4 w-4 mr-2'/>
                    Add a chapter
                    </>
                )}
              </Button> 
            {isCreating && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                        <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                   <Input
                                   disabled={isSubmitting}
                                   placeholder='e.g. Introduction to the Course'
                                      {...field}
                                   />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                           <Button disabled={!isValid || isSubmitting} type='submit'>Create</Button>
                    </form>
                </Form>
            )}

            {!isCreating && (
                <div className={cn("text-sm mt-2", !initialData.chapters.length && "text-muted-foreground italic")}>
                    {!initialData.chapters.length && "No chapters"}
                    <ChaptersListForLectures
                    onEdit= {onEdit}
                    onReorder={onReorder}
                    items={initialData.chapters || []}
                    />
                </div>
            )}

            {!isCreating && (
                <p className='text-xs text-muted-foreground mt-4'>
                    Drag and drop to reorder the chapters
                </p>
            )}

        </div>
    )
}
