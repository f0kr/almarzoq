"use client"

import * as z from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Course } from '@prisma/client'
import { formatPrice } from '@/lib/format'

interface PriceFormProps {
initialData: Course,
    courseId: string
}

const formSchema = z.object({
    price: z.coerce.number(),
})


export default function PriceForm({
    initialData,
    courseId
}: PriceFormProps) {

    const [isEditing, setIsEditing] = useState(false)

    const toggleEditing = () => {
        setIsEditing((prev) => !prev)
    }

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            price: initialData?.price || undefined
        }
    })

    const {isSubmitting, isValid} = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            await axios.patch(`/api/courses/${courseId}`, values)
            toast.success('Course price updated successfully.')
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
              Course Price
              <Button
              onClick={toggleEditing}
              variant="ghost">
                {isEditing && (
                    <>Cancel</>
                )}
                {!isEditing && (
                    <>
                    <Pencil className='h-4 w-4 mr-2'/>
                    Edit price
                    </>
                )}
              </Button>
            </div>
            {!isEditing && (
                <p className={cn(
                    "text-sm mt-2",
                    !initialData.price && "text-slate-500 italic"
                )}>{initialData.price ? formatPrice(initialData.price) : "No price set"}</p>
            )}
            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
                        <FormField
                        control={form.control}
                        name="price"
                        render={({field}) => (
                            <FormItem>
                                <FormControl>
                                    <Input type='number' step="0.01" disabled={isSubmitting} placeholder='Set a Price' {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}/>
                           <div className='flex items-center gap-x-2'>
                           <Button disabled={!isValid || isSubmitting} type='submit'>Save</Button>
                           </div>
                    </form>
                </Form>
            )}
        </div>
    )
}