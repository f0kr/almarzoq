"use client"

import * as z from 'zod'
import axios from 'axios'
import {zodResolver} from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import toast from 'react-hot-toast'

const formSchema = z.object({
    title: z.string().min(1, {
        message: 'Title is required',
    })
})


export default function CreatePage() {

    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: ''
        }
    })

    const {isSubmitting, isValid} = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
          const response = await axios.post("/api/courses", values)
          router.push(`/teacher/courses/${response.data.id}`)
          toast.success("Course created successfully")
        }catch {
            toast.error("Something went wrong. Please try again.")
        }
    }

    return(
        <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
            <div className='text-2xl'>Name Your Course</div>
            <p className='text-sm text-slate-600'>What would you like to name your course? Don&apos;t worry, you can change this later.</p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 mt-8'>
                  <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>
                            Course Title
                        </FormLabel>
                        <FormControl> 
                            <Input disabled={isSubmitting} placeholder="Course Title" {...field} />

                        </FormControl>
                        <FormDescription>
                            This is the title of your course. It will be visible to your students.
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                  )
                    }
                  />
                  <div className='flex items-center gap-x-2'>
                    <Link href="/">
                    <Button
                    type='button'
                    variant="ghost"
                    >
                        Cancel

                    </Button>
                    </Link>
                    <Button
                    type='submit'
                    disabled={!isValid || isSubmitting}
                    >
                        Continue
                    </Button>
                  </div>
                </form>
            </Form>
        </div>
    )
}