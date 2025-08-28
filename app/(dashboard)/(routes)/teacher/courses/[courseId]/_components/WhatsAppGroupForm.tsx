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

interface WhatsAppGroupFormProps {
  initialData: {
    whatsappUrl: string | null
  },
  courseId: string
}

const formSchema = z.object({
  whatsappUrl: z.string()
    .url("Please enter a valid URL")
    .regex(/(https?:\/\/)?(chat\.whatsapp\.com)\/[A-Za-z0-9]+/, "Must be a valid WhatsApp group link")
    .optional()
})

export default function WhatsAppGroupForm({
  initialData,
  courseId
}: WhatsAppGroupFormProps) {

  const [isEditing, setIsEditing] = useState(false)
  const toggleEditing = () => setIsEditing((prev) => !prev)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      whatsappUrl: initialData.whatsappUrl || ""
    }
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values)
      toast.success('WhatsApp group link updated.')
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
        WhatsApp Group
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
                    !initialData.whatsappUrl && "text-slate-500 italic"
                )}>{initialData.whatsappUrl ? initialData.whatsappUrl : "No WhatsApp group link"}</p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
            <FormField
              control={form.control}
              name="whatsappUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Group URL</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder='https://chat.whatsapp.com/...'
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
