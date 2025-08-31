"use client"

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface GroupUrlFormProps {
  initialData: {
    groupUrl: string | null
  },
  courseId: string
}

const formSchema = z.object({
  groupUrl: z.string()
    .url("Please enter a valid URL")
    .regex(
      /^(https?:\/\/)?(t\.me)\/(\+?[A-Za-z0-9_-]+)$/,
      "Must be a valid Telegram group link"
    )
    .optional()
});

export default function GroupUrlForm({
  initialData,
  courseId
}: GroupUrlFormProps) {

  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((prev) => !prev)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupUrl: initialData.groupUrl || ""
    }
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values)
      toast.success('Group link updated.')
      toggleEditing()
      router.refresh()

    } catch (error) {
      toast.error('Something went wrong.')
      console.log(error)
    }
  }

  return (
    <div className='mt-6 border bg-slate-100 rounded-md p-4'>
      <div className='font-medium flex items-center justify-between'>
        Group URL
        <Button
          onClick={toggleEditing}
          variant="ghost"
        >
          {isEditing ? "Cancel" : (
            <>
              <Pencil className='h-4 w-4 mr-2' />
              Edit link
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
                <p className={cn(
                    "text-sm mt-2",
                    !initialData.groupUrl && "text-slate-500 italic"
                )}>{initialData.groupUrl ? initialData.groupUrl : "No group link"}</p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
            <FormField
              control={form.control}
              name="groupUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder='https://t.me/+inviteCode'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-center gap-x-2'>
              <Button disabled={!isValid || isSubmitting} type='submit'>
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
