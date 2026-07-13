"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import toast from "react-hot-toast"

interface FileUploadProps {
    onChange: (url?: string, name?: string, key?: string) => void
    endpoint: keyof typeof ourFileRouter
}

export default function FileUpload({onChange, endpoint}: FileUploadProps) {
    return (
        <UploadDropzone
            appearance={{
                container: "rounded-xl border-[1.5px] border-dashed border-beige bg-paper",
                label: "text-ink text-sm font-semibold hover:text-clay",
                allowedContent: "text-grey",
                uploadIcon: "text-clay",
                button: "rounded-full bg-primary text-sm font-semibold ut-uploading:bg-tan after:bg-tan",
            }}
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
              if (!res || res.length === 0) return;

              const file = res[0]; 

             console.log("Uploaded file:", file);
             onChange(file.ufsUrl, file.name, file.key);
  }}
            onUploadError={(error: Error) => {
                toast.error(`${error?.message}`)
                console.log(error)
            }}
        />
    )
}