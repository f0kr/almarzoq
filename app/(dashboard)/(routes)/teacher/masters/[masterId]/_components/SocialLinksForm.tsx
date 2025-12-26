"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SOCIAL_PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn'] as const

const socialLinkSchema = z.object({
    platform: z.enum(SOCIAL_PLATFORMS),
    url: z.string().url('Please enter a valid URL').optional().or(z.literal(''))
})

const formSchema = z.object({
    links: z.array(socialLinkSchema).default([])
})

interface SocialLinksFormProps {
    initialData: {
        socialLinks: string[]
    }
    masterId: string

}

// Parse stored links format
const parseSocialLinks = (links: string[]) => {
    if (!links || links.length === 0) return []
    
    return links
        .map(link => {
            try {
                const [platform, url] = link.split('|')
                if (platform && SOCIAL_PLATFORMS.includes(platform as any)) {
                    return { platform: platform as typeof SOCIAL_PLATFORMS[number], url: url || '' }
                }
                return null
            } catch {
                return null
            }
        })
        .filter(Boolean) as z.infer<typeof socialLinkSchema>[]
}

// Format links for API
const formatSocialLinks = (links: z.infer<typeof socialLinkSchema>[]) => {
    return links
        .filter(link => link.url)
        .map(link => `${link.platform}|${link.url}`)
}

export default function SocialLinksForm({ initialData, masterId }: SocialLinksFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            links: parseSocialLinks(initialData.socialLinks || [])
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'links'
    })
    const { isSubmitting, isValid } = form.formState

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formattedLinks = formatSocialLinks(values.links || [])
            await axios.patch(`/api/masters/${masterId}`, { socialLinks: formattedLinks })
            toast.success("Social links updated.")
            setIsEditing(false)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="mt-6 border bg-slate-100 rounded-lg p-4">
            <div className="font-medium flex items-center justify-between">
                Social Links
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="ghost"
                >
                    {isEditing ? (
                        <>Cancel</>
                    ) : (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </>
                    )}
                </Button>
            </div>
            {!isEditing && (
                <div className='mt-2'>
                    {fields.length === 0 ? (
                        <p className='text-sm text-slate-500 italic'>No social links added</p>
                    ) : (
                        <div className='space-y-2'>
                            {fields.map((field, index) => (
                                <div key={field.id} className='text-sm'>
                                    <span className='font-medium text-slate-700'>{field.platform}:</span>{' '}
                                    <a
                                        href={field.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='text-blue-600 hover:underline break-all'
                                    >
                                        {field.url}
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {isEditing && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mt-4"
                    >
                        <div className='space-y-3 bg-white p-3 rounded-md'>
                            {fields.map((field, index) => (
                                <div key={field.id} className='flex gap-2 items-start'>
                                    <FormField
                                        control={form.control}
                                        name={`links.${index}.platform`}
                                        render={({ field }) => (
                                            <FormItem className='flex-shrink-0'>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger className='w-32'>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {SOCIAL_PLATFORMS.map((platform) => (
                                                            <SelectItem key={platform} value={platform}>
                                                                {platform}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`links.${index}.url`}
                                        render={({ field }) => (
                                            <FormItem className='flex-1'>
                                                <FormControl>
                                                    <Input
                                                        disabled={isSubmitting}
                                                        placeholder='https://'
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='sm'
                                        onClick={() => remove(index)}
                                        className='flex-shrink-0'
                                    >
                                        <Trash2 className='h-4 w-4 text-red-500' />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => append({ platform: 'Instagram', url: '' })}
                            className='w-full'
                        >
                            <Plus className='h-4 w-4 mr-2' />
                            Add Link
                        </Button>

                        <div className='flex items-center gap-x-2'>
                            <Button disabled={!isValid || isSubmitting} type='submit'>Save</Button>
                        </div>
                    </form>
                </Form>
            )}
        </div>
    )
}
