"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { CharacterCount, Placeholder } from "@tiptap/extensions"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"
import { useCallback, useRef, useState } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUploadThing } from "@/lib/uploadthing"

interface ArticleEditorProps {
  value: string
  onChange: (html: string) => void
  disabled?: boolean
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export function ArticleEditor({ value, onChange, disabled }: ArticleEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => {
      const uploaded = res?.[0]
      setIsUploading(false)
      if (!uploaded) return
      editor?.chain().focus().setImage({ src: uploaded.ufsUrl, alt: "" }).run()
    },
    onUploadError: (error) => {
      setIsUploading(false)
      toast.error(error.message)
    },
  })

  const editor = useEditor({
    // Tiptap renders on the client only; without this Next warns about an SSR
    // mismatch on every mount.
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer nofollow" } },
      }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "اكتب مقالك هنا…" }),
      CharacterCount,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        // The article is Arabic: the writing surface is RTL by default, and
        // carries the same class the published article uses so the editor is a
        // true preview rather than an approximation.
        dir: "rtl",
        lang: "ar",
        class: "prose-article min-h-[420px] px-4 py-4 outline-none",
      },
    },
  })

  const onPickImage = useCallback(
    async (file: File | undefined) => {
      if (!file) return
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("Image is larger than 8 MB")
        return
      }
      setIsUploading(true)
      await startUpload([file])
    },
    [startUpload]
  )

  const onSetLink = useCallback(() => {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("Link URL:", previous ?? "https://")

    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Links must start with http:// or https://")
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return (
      <div className="rounded-2xl border border-beige bg-card">
        <div className="h-[480px] animate-pulse rounded-2xl bg-paper" />
      </div>
    )
  }

  const words = editor.storage.characterCount.words()

  return (
    <div className="rounded-2xl border border-beige bg-card overflow-hidden">
      {/* Toolbar stays LTR: these are tools, not content. */}
      <div className="flex flex-wrap items-center gap-1 border-b border-beige bg-paper px-2 py-2">
        <ToolButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          label="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          label="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          label="Underline"
        >
          <Underline className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          label="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          label="Subheading"
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          label="Bullet list"
        >
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          label="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolButton>

        <Divider />

        <ToolButton onClick={onSetLink} active={editor.isActive("link")} label="Link">
          <Link2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => fileInputRef.current?.click()}
          active={false}
          disabled={isUploading}
          label="Insert image"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
        </ToolButton>

        <Divider />

        {/* Right-aligned first: it's the default for Arabic. */}
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          label="Align centre"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
          label="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolButton>

        <div className="ml-auto flex items-center gap-1">
          <ToolButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            disabled={!editor.can().undo()}
            label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            disabled={!editor.can().redo()}
            label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </ToolButton>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void onPickImage(e.target.files?.[0])
          // Reset so picking the same file twice still fires a change.
          e.target.value = ""
        }}
      />

      <EditorContent editor={editor} />

      <div className="border-t border-beige bg-paper px-4 py-2 text-xs text-muted-foreground">
        {words} {words === 1 ? "word" : "words"}
      </div>
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-beige" aria-hidden />
}

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void
  active: boolean
  disabled?: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-8 w-8 bg-transparent text-foreground hover:bg-beige hover:text-foreground",
        active && "bg-clay text-paper hover:bg-clay hover:text-paper"
      )}
    >
      {children}
    </Button>
  )
}
