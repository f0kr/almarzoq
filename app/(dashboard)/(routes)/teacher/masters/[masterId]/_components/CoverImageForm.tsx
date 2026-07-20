"use client"

import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import FileUpload from "@/components/FileUpload"
import toast from "react-hot-toast"
import { ImageIcon, Pencil, PlusCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

// Cover images are enforced to ~3:1 so they crop well at every viewport
// (the public page shows a band between roughly 2.2:1 and 5:1).
const COVER_RATIO = 3
const RATIO_TOLERANCE = 0.15 // ±5%
const MIN_WIDTH = 1200

const validateCover = (file: File) =>
    new Promise<string | null>((resolve) => {
        const url = URL.createObjectURL(file)
        const img = new window.Image()
        img.onload = () => {
            URL.revokeObjectURL(url)
            const ratio = img.naturalWidth / img.naturalHeight
            if (img.naturalWidth < MIN_WIDTH) {
                resolve(
                    `Image is too small (${img.naturalWidth}px wide). Use at least ${MIN_WIDTH}×${MIN_WIDTH / COVER_RATIO}px.`
                )
            } else if (Math.abs(ratio - COVER_RATIO) > RATIO_TOLERANCE) {
                resolve(
                    `Wrong aspect ratio (${img.naturalWidth}×${img.naturalHeight}). The cover must be 3:1 — for example 1500×500px.`
                )
            } else {
                resolve(null)
            }
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve("Could not read that image file.")
        }
        img.src = url
    })

interface CoverImageFormProps {
    initialData: {
        coverUrl: string | null
    }
    masterId: string
}

export default function CoverImageForm({ initialData, masterId }: CoverImageFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const router = useRouter()

    const onSubmit = async (values: { coverUrl: string }) => {
        try {
            await axios.patch(`/api/masters/${masterId}`, values)
            toast.success("Cover image updated")
            setIsEditing(false)
            router.refresh()
        } catch {
            toast.error("Something went wrong")
        }
    }

    return (
        <div className="mt-6 border bg-muted rounded-lg p-4">
            <div className="font-medium flex items-center justify-between">
                Cover Image
                <Button onClick={() => setIsEditing(!isEditing)} variant="ghost">
                    {isEditing && <>Cancel</>}
                    {!isEditing && !initialData.coverUrl && (
                        <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Upload image
                        </>
                    )}
                    {!isEditing && initialData.coverUrl && (
                        <>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit image
                        </>
                    )}
                </Button>
            </div>
            {!isEditing &&
                (!initialData.coverUrl ? (
                    <div className="flex items-center rounded-md justify-center h-32 bg-secondary mt-2">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="relative aspect-[3/1] mt-2">
                        <Image
                            alt="Cover"
                            fill
                            className="object-cover rounded-md"
                            src={initialData.coverUrl}
                            unoptimized
                        />
                    </div>
                ))}
            {isEditing && (
                <div>
                    <FileUpload
                        endpoint="masterCover"
                        validate={validateCover}
                        onChange={(url) => {
                            if (url) {
                                onSubmit({ coverUrl: url })
                            }
                        }}
                    />
                    <div className="text-xs text-muted-foreground mt-4">
                        Required: 3:1 aspect ratio, at least 1200×400px (e.g. 1500×500).
                        Shown behind the profile image on the public page.
                    </div>
                </div>
            )}
        </div>
    )
}
