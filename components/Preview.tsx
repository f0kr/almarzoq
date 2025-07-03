"use client"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.bubble.css"

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