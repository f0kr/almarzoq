"use client"

import axios from "axios"
import { CalendarClock, Check, Eye, Loader2, Undo2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { langAttrs } from "@/lib/lang"
import { REVIEW_REASONS } from "@/lib/journal/reviewReasons"
import { cn } from "@/lib/utils"

export type ReviewArticle = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  contentHtml: string
  status: string
  readingMinutes: number | null
  submittedAt: string | null
  publishedAt: string | null
  categoryId: string | null
  categoryName: string | null
  proposedCategory: string | null
  authorName: string
  authorAvatar: string | null
  authorTeacherId: string | null
  resources: { label: string; url: string }[]
}

type Category = { id: string; name: string }
type Teacher = { id: string; name: string }

const KEEP_CATEGORY = "__keep__"
const NO_TEACHER = "__none__"

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
})

/** `datetime-local` wants local wall-clock time, not an ISO string. */
function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function ArticleReviewCard({
  article,
  categories,
  teachers,
}: {
  article: ReviewArticle
  categories: Category[]
  teachers: Teacher[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)

  const [reasons, setReasons] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [categoryId, setCategoryId] = useState(KEEP_CATEGORY)
  const [teacherId, setTeacherId] = useState(article.authorTeacherId ?? NO_TEACHER)
  const [publishAt, setPublishAt] = useState(() => {
    const inAnHour = new Date(Date.now() + 60 * 60 * 1000)
    return toLocalInputValue(inAnHour)
  })

  const decide = async (
    decision: "APPROVED" | "CHANGES_REQUESTED",
    options: { schedule?: boolean } = {}
  ) => {
    try {
      setBusy(decision + (options.schedule ? "-scheduled" : ""))

      await axios.post(`/api/journal/articles/${article.id}/review`, {
        decision,
        reasons,
        note,
        categoryId: categoryId === KEEP_CATEGORY ? null : categoryId,
        teacherId: teacherId === NO_TEACHER ? null : teacherId,
        publishAt:
          decision === "APPROVED" && options.schedule
            ? new Date(publishAt).toISOString()
            : null,
      })

      toast.success(
        decision === "APPROVED"
          ? options.schedule
            ? "Scheduled"
            : "Published"
          : "Sent back to the author"
      )
      setOpen(false)
      router.refresh()
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Something went wrong"
      toast.error(message)
      console.log(error)
    } finally {
      setBusy(null)
    }
  }

  const takeDown = async () => {
    try {
      setBusy("archive")
      await axios.delete(`/api/journal/articles/${article.id}/review`)
      toast.success("Taken down")
      setOpen(false)
      router.refresh()
    } catch (error) {
      const message =
        axios.isAxiosError(error) && typeof error.response?.data === "string"
          ? error.response.data
          : "Something went wrong"
      toast.error(message)
    } finally {
      setBusy(null)
    }
  }

  const toggleReason = (code: string) =>
    setReasons((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
    )

  const isLive = article.status === "PUBLISHED" || article.status === "SCHEDULED"

  return (
    <li className="overflow-hidden rounded-2xl border border-beige bg-card">
      <div className="flex gap-4 p-4">
        <div className="relative hidden h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-paper sm:block">
          {article.coverUrl && (
            <Image
              src={article.coverUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
              unoptimized
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {article.categoryName ? (
              <Badge variant="category">{article.categoryName}</Badge>
            ) : article.proposedCategory ? (
              <Badge variant="clay">proposed: {article.proposedCategory}</Badge>
            ) : (
              <Badge variant="clay">no category</Badge>
            )}
            {article.readingMinutes && (
              <span className="text-xs text-muted-foreground">
                {article.readingMinutes} min read
              </span>
            )}
            {article.status === "SCHEDULED" && article.publishedAt && (
              <span className="text-xs font-semibold text-clay">
                goes live {dateTime.format(new Date(article.publishedAt))}
              </span>
            )}
          </div>

          <h3
            {...langAttrs(article.title)}
            className="bidi-plaintext mt-2 font-serif text-lg font-semibold"
          >
            {article.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full bg-paper">
              {article.authorAvatar && (
                <Image
                  src={article.authorAvatar}
                  alt=""
                  fill
                  sizes="24px"
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <span className="text-sm text-muted-foreground">{article.authorName}</span>
            {article.authorTeacherId && (
              <Badge variant="sage" className="text-[10px]">
                claims master
              </Badge>
            )}
            {article.submittedAt && (
              <span className="text-xs text-muted-foreground">
                · submitted {dateTime.format(new Date(article.submittedAt))}
              </span>
            )}
          </div>

          <div className="mt-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="soft">
                  <Eye className="mr-1.5 h-4 w-4" />
                  Read and decide
                </Button>
              </DialogTrigger>

              <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                  <DialogTitle
                    {...langAttrs(article.title)}
                    className="bidi-plaintext text-start font-serif"
                  >
                    {article.title}
                  </DialogTitle>
                  <DialogDescription className="text-start">
                    by {article.authorName}
                  </DialogDescription>
                </DialogHeader>

                {/* Sanitised on write in lib/journal/sanitize.ts — this is the
                    stored, already-cleaned HTML. */}
                <article
                  dir="rtl"
                  lang="ar"
                  className="prose-article max-h-[40vh] overflow-y-auto rounded-xl border border-beige bg-paper p-4"
                  dangerouslySetInnerHTML={{ __html: article.contentHtml }}
                />

                {article.resources.length > 0 && (
                  <div dir="rtl" lang="ar" className="rounded-xl border border-beige p-3">
                    <p className="text-xs font-semibold">المصادر</p>
                    <ul className="mt-1 space-y-1">
                      {article.resources.map((resource) => (
                        <li key={resource.url} className="text-xs">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-clay underline"
                          >
                            {resource.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                      Category
                      {article.proposedCategory && (
                        <span className="ml-1 font-normal text-muted-foreground">
                          (author proposed &quot;{article.proposedCategory}&quot;)
                        </span>
                      )}
                    </label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={KEEP_CATEGORY}>
                          {article.categoryName ? `Keep: ${article.categoryName}` : "Leave unset"}
                        </SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold">
                      Master profile
                      <span className="ml-1 font-normal text-muted-foreground">
                        (author&apos;s claim — verify)
                      </span>
                    </label>
                    <Select value={teacherId} onValueChange={setTeacherId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_TEACHER}>Not a master</SelectItem>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-xl border border-beige p-3">
                  <p className="text-sm font-semibold">If sending it back</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {REVIEW_REASONS.map((reason) => (
                      <label
                        key={reason.code}
                        className="flex cursor-pointer items-start gap-2 text-sm"
                      >
                        <Checkbox
                          checked={reasons.includes(reason.code)}
                          onCheckedChange={() => toggleReason(reason.code)}
                          className="mt-0.5"
                        />
                        <span>
                          {reason.en}
                          <span dir="rtl" lang="ar" className="block text-xs text-muted-foreground">
                            {reason.ar}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <Textarea
                    dir="rtl"
                    lang="ar"
                    rows={3}
                    className="mt-3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ملاحظة للكاتب (تظهر له كما هي)"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-3 border-t border-beige pt-4">
                  <Button
                    variant="soft"
                    disabled={busy !== null}
                    onClick={() => decide("APPROVED")}
                  >
                    {busy === "APPROVED" ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 h-4 w-4" />
                    )}
                    Publish now
                  </Button>

                  <div className="flex items-end gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Or schedule for</label>
                      <input
                        type="datetime-local"
                        value={publishAt}
                        onChange={(e) => setPublishAt(e.target.value)}
                        className="h-9 rounded-full border border-beige bg-card px-3 text-sm"
                      />
                    </div>
                    <Button
                      variant="default"
                      disabled={busy !== null}
                      onClick={() => decide("APPROVED", { schedule: true })}
                    >
                      {busy === "APPROVED-scheduled" ? (
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      ) : (
                        <CalendarClock className="mr-1.5 h-4 w-4" />
                      )}
                      Schedule
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    disabled={busy !== null}
                    onClick={() => decide("CHANGES_REQUESTED")}
                    className={cn("ml-auto")}
                  >
                    {busy === "CHANGES_REQUESTED" ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Undo2 className="mr-1.5 h-4 w-4" />
                    )}
                    Request changes
                  </Button>

                  {isLive && (
                    <Button variant="ghost" disabled={busy !== null} onClick={takeDown}>
                      Take down
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </li>
  )
}
