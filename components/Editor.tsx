"use client"
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

interface EditorProps {
    value: string
    onChange: (value: string) => void
}

// Direction/align let a user manually mark a paragraph RTL when mixing
// Arabic and English content — auto-detection (see globals.css) covers
// most cases, this is the override for when it guesses wrong.
const modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ align: [] }],
        [{ direction: "rtl" }],
        ["blockquote", "link"],
        ["clean"],
    ],
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
                modules={modules}
            />
        </div>
    )
}
