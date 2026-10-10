"use client"

import axios from "axios"
import { ImagePlus, Loader2, Plus, Send, Trash2, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

import FileUpload from "@/components/FileUpload"
import { ArticleEditor } from "@/components/journal/ArticleEditor"
import { CoverImage } from "@/components/journal/CoverImage"
import { ArticleTerms } from "@/components/journal/ArticleTerms"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export type ArticleFormCategory = { id: string; name: string; nameAr: string | null }
export type ArticleFormTeacher = { id: string; name: string }

export type ArticleFormInitial = {
  id?: string
  title: string
  coverUrl: string | null
  coverKey: string | null
  categoryId: string | null
  proposedCategory: string | null
  contentHtml: string
  resources: { label: string; url: string }[]
  displayName: string
  avatarUrl: string | null
  bio: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
  teacherId: string | null
}

interface ArticleFormProps {
  initial: ArticleFormInitial
  categories: ArticleFormCategory[]
  teachers: ArticleFormTeacher[]
}

/** The sentinel the category select uses for "none of these". */
const OTHER = "__other__"
const NO_TEACHER = "__none__"

export function ArticleForm({ initial, categories, teachers }: ArticleFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initial.title)
  const [coverUrl, setCoverUrl] = useState(initial.coverUrl)
  const [coverKey, setCoverKey] = useState(initial.coverKey)
  const [categoryId, setCategoryId] = useState<string>(
    initial.categoryId ?? (initial.proposedCategory ? OTHER : "")
  )
  const [proposedCategory, setProposedCategory] = useState(initial.proposedCategory ?? "")
  const [contentHtml, setContentHtml] = useState(initial.contentHtml)
  const [resources, setResources] = useState(initial.resources)

  const [displayName, setDisplayName] = useState(initial.displayName)
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl)
  const [bio, setBio] = useState(initial.bio ?? "")
  const [instagram, setInstagram] = useState(initial.instagram ?? "")
  const [facebook, setFacebook] = useState(initial.facebook ?? "")
  const [website, setWebsite] = useState(initial.website ?? "")
  const [teacherId, setTeacherId] = useState(initial.teacherId ?? NO_TEACHER)

  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [busy, setBusy] = useState<"draft" | "submit" | null>(null)

  const isEdit = Boolean(initial.id)

  const save = async (action: "draft" | "submit") => {
    if (action === "submit" && !acceptedTerms) {
      toast.error("You must accept the publishing declaration before submitting")
      return
    }

    const payload = {
      action,
      acceptedTerms,
      title,
      coverUrl,
      coverKey,
      categoryId: categoryId === OTHER || !categoryId ? null : categoryId,
      proposedCategory: categoryId === OTHER ? proposedCategory : null,
      contentHtml,
      resources,
      displayName,
      avatarUrl,
      bio,
      instagram,
      facebook,
      website,
      teacherId: teacherId === NO_TEACHER ? null : teacherId,
    }

    try {
      setBusy(action)

      if (isEdit) {
        await axios.patch(`/api/journal/articles/${initial.id}`, payload)
      } else {
        await axios.post("/api/journal/articles", payload)
      }

      toast.success(action === "submit" ? "Sent for review" : "Draft saved")
      router.push("/journal/mine")
      router.refresh()
    } catch (error) {
      // The API answers in Arabic with the specific problem — show that, not a
      // generic failure.
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Couldn't save. Try again."
      toast.error(message)
      console.log(error)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* --- The article ------------------------------------------------- */}
      <section className="space-y-5 rounded-2xl border border-beige bg-card p-5">
        <h2 className="font-serif text-lg font-semibold">The article</h2>

        <Field label="Title" hint="Written in Arabic — this is the headline readers see.">
          <Input
            dir="rtl"
            lang="ar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان المقال"
            className="text-lg"
          />
        </Field>

        <Field
          label="Cover image"
          hint="Any shape works — it is fitted into the frame, never cropped. Optional, but articles with a cover get read more."
        >
          {coverUrl ? (
            // Framed exactly as the journal will frame it, so the author sees
            // the real result rather than a differently-cropped preview.
            <div className="relative overflow-hidden rounded-xl border border-beige">
              <CoverImage
                src={coverUrl}
                className="aspect-[4/3] sm:aspect-video"
                sizes="(max-width:768px) 100vw, 640px"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove cover"
                className="absolute right-2 top-2 bg-card"
                onClick={() => {
                  setCoverUrl(null)
                  setCoverKey(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <FileUpload
              endpoint="articleCover"
              onChange={(url, _name, key) => {
                if (!url) return
                setCoverUrl(url)
                setCoverKey(key ?? null)
                toast.success("Cover uploaded")
              }}
            />
          )}
        </Field>

        <Field label="Category">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                  {category.nameAr ? ` · ${category.nameAr}` : ""}
                </SelectItem>
              ))}
              <SelectItem value={OTHER}>Other…</SelectItem>
            </SelectContent>
          </Select>

          {categoryId === OTHER && (
            <Input
              dir="rtl"
              lang="ar"
              value={proposedCategory}
              onChange={(e) => setProposedCategory(e.target.value)}
              placeholder="اقترح تصنيفاً"
              className="mt-2"
            />
          )}
        </Field>

        <Field label="Body">
          <ArticleEditor value={contentHtml} onChange={setContentHtml} disabled={busy !== null} />
        </Field>
      </section>

      {/* --- Resources ---------------------------------------------------- */}
      <section className="space-y-4 rounded-2xl border border-beige bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-semibold">Resources</h2>
            <p className="text-sm text-muted-foreground">
              Sources, references or further reading. Optional.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setResources((rows) => [...rows, { label: "", url: "" }])}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {resources.length === 0 && (
          <p className="text-sm italic text-muted-foreground">No resources added.</p>
        )}

        {resources.map((resource, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row">
            <Input
              dir="rtl"
              lang="ar"
              value={resource.label}
              placeholder="اسم المصدر"
              onChange={(e) =>
                setResources((rows) =>
                  rows.map((row, i) => (i === index ? { ...row, label: e.target.value } : row))
                )
              }
              className="sm:flex-1"
            />
            <Input
              value={resource.url}
              placeholder="https://…"
              onChange={(e) =>
                setResources((rows) =>
                  rows.map((row, i) => (i === index ? { ...row, url: e.target.value } : row))
                )
              }
              className="sm:flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Remove resource"
              onClick={() => setResources((rows) => rows.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </section>

      {/* --- The byline --------------------------------------------------- */}
      <section className="space-y-5 rounded-2xl border border-beige bg-card p-5">
        <div>
          <h2 className="font-serif text-lg font-semibold">About you</h2>
          <p className="text-sm text-muted-foreground">
            This is the byline on the article. It is saved to your editor profile and reused
            next time.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-beige bg-paper">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" fill className="object-cover" unoptimized />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-clay">
                {displayName.trim().charAt(0) || "؟"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <Field label="Name shown on the article">
              <Input
                dir="rtl"
                lang="ar"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="الاسم"
              />
            </Field>
          </div>
        </div>

        <Field
          label="Profile picture"
          hint="Optional. Without one we use your account picture, then your initial."
        >
          {avatarUrl ? (
            <Button type="button" variant="ghost" onClick={() => setAvatarUrl(null)}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Replace picture
            </Button>
          ) : (
            <FileUpload
              endpoint="userAvatar"
              onChange={(url) => {
                if (!url) return
                setAvatarUrl(url)
                toast.success("Picture uploaded")
              }}
            />
          )}
        </Field>

        <Field label="Short bio" hint="Optional.">
          <Textarea
            dir="rtl"
            lang="ar"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="نبذة قصيرة عنك"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instagram">
            <Input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="@handle"
            />
          </Field>
          <Field label="Facebook">
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="@handle"
            />
          </Field>
          <Field label="Website">
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>

        {teachers.length > 0 && (
          <Field
            label="Are you one of the academy's masters?"
            hint="Links the article to your master page. The admin confirms this during review."
          >
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="No" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TEACHER}>No</SelectItem>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </section>

      <ArticleTerms
        checked={acceptedTerms}
        onCheckedChange={setAcceptedTerms}
        disabled={busy !== null}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="soft"
          size="lg"
          className="h-12"
          disabled={busy !== null || !acceptedTerms}
          onClick={() => save("submit")}
        >
          {busy === "submit" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Submit for review
        </Button>
        <Button
          type="button"
          variant="default"
          size="lg"
          className="h-12"
          disabled={busy !== null}
          onClick={() => save("draft")}
        >
          {busy === "draft" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save draft
        </Button>
        {!acceptedTerms && (
          <p className="text-sm text-muted-foreground">
            Accept the declaration above to submit.
          </p>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  )
}
