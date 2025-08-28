"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import toast from "react-hot-toast"

interface FileUploadProps {
    onChange: (file?: { url: string; name: string }) => void
    endpoint: keyof typeof ourFileRouter
}


export default function FileUpload({onChange, endpoint}: FileUploadProps) {
    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
            onChange({
            url: res[0].ufsUrl,  // file URL
            name: res[0].name,   // original filename
            })
            }}
            onUploadError={(error: Error) => {
                toast.error(`${error?.message}`)
                console.log(error)
            }}
        />
    )
}