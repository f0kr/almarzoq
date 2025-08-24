"use client"
import dynamic from "next/dynamic"
import "react-quill-new/dist/quill.bubble.css"

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false })

interface PreviewProps {
    value: string
}

export const Preview = ({
    value,
}: PreviewProps) => {

    return(
            <ReactQuill
                theme="bubble"
                value={value}
                readOnly
            />
    )
}