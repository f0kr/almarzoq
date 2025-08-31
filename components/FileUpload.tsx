"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import toast from "react-hot-toast"

interface FileUploadProps {
    onChange: (url?: string, name?: string) => void
    endpoint: keyof typeof ourFileRouter
}

export default function FileUpload({onChange, endpoint}: FileUploadProps) {
    return (
        <UploadDropzone
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              if (!res || res.length === 0) return;

              const file = res[0]; 

             console.log("Uploaded file:", file);
             onChange(file.ufsUrl, file.name);
  }}
            onUploadError={(error: Error) => {
                toast.error(`${error?.message}`)
                console.log(error)
            }}
        />
    )
}