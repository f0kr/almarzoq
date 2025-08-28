"use client"

import { UploadDropzone } from "@/lib/uploadthing"
import { ourFileRouter } from "@/app/api/uploadthing/core"
import toast from "react-hot-toast"

interface FileUploadProps {
  onChange: (file?: string | { url: string; name: string }) => void;
  endpoint: keyof typeof ourFileRouter;
}


export default function FileUpload({onChange, endpoint}: FileUploadProps) {
    return (
        <UploadDropzone
            endpoint={endpoint}
onClientUploadComplete={(res) => {
  if (res && res[0]) {
    // Send both, caller decides what to use
    onChange({ url: res[0].ufsUrl, name: res[0].name });
  }
}}
            onUploadError={(error: Error) => {
                toast.error(`${error?.message}`)
                console.log(error)
            }}
        />
    )
}