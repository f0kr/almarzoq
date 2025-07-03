"use client"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

interface EditorProps {
    value: string
    onChange: (value: string) => void
}

export const Editor = ({
    value,
    onChange,
}: EditorProps) => {

    return(
        <div className="bg-white">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
            />
        </div>
    )
}