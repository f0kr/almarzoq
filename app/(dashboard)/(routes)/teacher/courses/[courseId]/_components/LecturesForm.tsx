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
import { LecturesList } from './LecturesList'

interface LecturesFormProps {
    initialData: Course & {lectures: Lecture[]},
    chaptersInitialData: Course & {chapters: Chapter[]},
    courseId: string
}

const formSchema = z.object({
    title: z.string().min(1)
})


export default function LecturesForm({
    initialData,
    chaptersInitialData,
    courseId
}: LecturesFormProps) {

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

/*     const onRename = async (id: string, title: string) => {
        try {
            await axios.patch(`/api/courses/${courseId}/lectures/${id}`, {title})
            toast.success('Lecture title updated.')
            router.refresh()
        } catch (error) {
            toast.error('Something went wrong while updating the lecture title.')
            console.log(error)
        }
    } */

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            await axios.post(`/api/courses/${courseId}/lectures`, values)
            toast.success('Lecture created successfully.')
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
            await axios.put(`/api/courses/${courseId}/lectures/reorder`, {
                list: updateData
            })
            toast.success('Lecture reordered successfully.')
            router.refresh()
        }catch (error) {
            toast.error('Something went wrong while reordering Lectures.')
            console.log(error)
        }finally {
            setIsUpdating(false)
        }
    }

    const onDelete = async (id:string) => {
        try {
            setIsUpdating(true)
            await axios.delete(`/api/courses/${courseId}/lectures/${id}`)
            toast.success('Lecture deleted successfully.')
            router.refresh()
        }catch (error) {
            toast.error('Something went wrong while deleting the lecture.')
            console.log(error)
        }finally {
            setIsUpdating(false)
        }
    }

    return(
        <div className='relative mt-6 border bg-slate-100 rounded-md p-4'>
            {isUpdating && (
                <div className='absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center'>
                    <Loader2 className='animate-spin h-6 w-6 text-sky-700'/>
                </div>
            )}
            <div className='font-medium flex items-center justify-between'>
              Course lectures
              <Button
              onClick={toggleCreating}
              variant="ghost">
                {isCreating && (
                    <>Cancel</>
                )}
                {!isCreating && (
                    <>
                    <PlusCircle className='h-4 w-4 mr-2'/>
                    Add a lecture
                    </>
                )}
              </Button>
            </div> 
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
                                   placeholder='e.g. Lecture 1'
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
                <div className={cn("text-sm mt-2", !initialData.lectures.length && "text-slate-500 italic")}>
                    {!initialData.lectures.length && "No Lectures"}
                    <LecturesList
                    initialData={chaptersInitialData}
                    onDelete={onDelete}
                    onReorder={onReorder}
                    courseId={courseId}
                    items={initialData.lectures || []}
                    />
                </div>
            )}

            {!isCreating && (
                <p className='text-xs text-muted-foreground mt-4'>
                    Drag and drop to reorder the lectures
                </p>
            )}

        </div>
    )
}