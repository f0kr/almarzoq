"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import FileUpload from '@/components/FileUpload'
import toast from "react-hot-toast"
import { ImageIcon, Pencil, PlusCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const formSchema = z.object({
    profileUrl: z.string().optional()
})

interface ProfileUrlFormProps {
    initialData: {
        profileUrl: string | null
    }
    masterId: string
}

export default function ProfileUrlForm({ initialData, masterId }: ProfileUrlFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            profileUrl: initialData.profileUrl || ""
        }
    })

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.patch(`/api/masters/${masterId}`, values)
            toast.success("Master profile URL updated")
            setIsEditing(false)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="mt-6 border bg-muted rounded-lg p-4">
            <div className="font-medium flex items-center justify-between">
                Profile URL
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="ghost"
                >
                  {isEditing && (
                      <>Cancel</>
                  )}
                  {!isEditing && !initialData.profileUrl &&(
                      <>
                      <PlusCircle className='h-4 w-4 mr-2'/>
                      Upload image
                      </>
                  )}
                  {!isEditing && initialData.profileUrl && (
                      <>
                      <Pencil className='h-4 w-4 mr-2'/>
                      Edit image
                      </>
                  )}
                </Button>
            </div>
            {!isEditing && (
                !initialData.profileUrl ? (
                    <div className='flex items-center rounded-md justify-center h-60 bg-secondary '>
                        <ImageIcon className='h-10 w-10 text-muted-foreground '/>
                    </div>
                ) : (
                    <div className='relative aspect-video mt-2'>
                        <Image
                        alt='Upload'
                        fill
                        className='object-cover rounded-md'
                        src={initialData.profileUrl}
                        />
                    </div>
                )
            )}
            {isEditing && (
                <div>
                    <FileUpload
                    endpoint='profileUrl'
                    onChange={(url) => {
                        if (url) {
                            onSubmit({profileUrl: url})
                        }
                    }}
                    />
                    <div className='text-xs text-muted-foreground mt-4'>
                        16:9 aspect ratio recommended
                    </div>
                </div>
            )}
        </div>
    )
}
