"use client"

import * as z from 'zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FileUpload from '@/components/FileUpload'

interface ProfileImageFormProps {
    initialData: {
        profileImage: string | null
    },
    masterId: string
}

const formSchema = z.object({
    profileImage: z.string().min(1, {
        message: 'Image is required',
    })
})


export default function ProfileImageForm({
    initialData,
    masterId
}: ProfileImageFormProps) {

    const [isEditing, setIsEditing] = useState(false)

    const toggleEditing = () => {
        setIsEditing((prev) => !prev)
    }

    const router = useRouter()


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try{
            await axios.patch(`/api/masters/${masterId}`, values)
            toast.success('Image updated.')
            toggleEditing()
            router.refresh()
            
        }catch (error) {
            toast.error('Something went wrong.')
            console.log(error)
        }
    }

    return(
        <div className='mt-6 border bg-muted rounded-md p-4'>
            <div className='font-medium flex items-center justify-between'>
              Profile Image
              <Button
              onClick={toggleEditing}
              variant="ghost">
                {isEditing && (
                    <>Cancel</>
                )}
                {!isEditing && !initialData.profileImage &&(
                    <>
                    <PlusCircle className='h-4 w-4 mr-2'/>
                    Upload image
                    </>
                )}
                {!isEditing && initialData.profileImage && (
                    <>
                    <Pencil className='h-4 w-4 mr-2'/>
                    Edit image
                    </>
                )}
              </Button>
            </div>
            {!isEditing && (
                !initialData.profileImage ? (
                    <div className='flex items-center rounded-md justify-center h-60 bg-secondary '>
                        <ImageIcon className='h-10 w-10 text-muted-foreground '/>
                    </div>
                ) : (
                    <div className='relative aspect-square mt-2 max-w-xs'>
                        <Image
                        alt='Profile'
                        fill
                        className='object-cover rounded-md'
                        src={initialData.profileImage}
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
                            onSubmit({profileImage: url})
                        }
                    }}
                    />
                </div>
            )}
        </div>
    )
}
