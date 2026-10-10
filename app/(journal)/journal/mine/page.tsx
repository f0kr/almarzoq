import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { PenLine } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { langAttrs } from "@/lib/lang"
import { REVIEW_REASON_BY_CODE } from "@/lib/journal/reviewReasons"
import type { ArticleStatus } from "@prisma/client"

export const metadata: Metadata = {
  title: "My articles",
  robots: { index: false, follow: false },
}

/** Status as the author should read it, not as the database spells it. */
const STATUS_LABEL: Record<ArticleStatus, { label: string; variant: "sage" | "clay" | "category" }> = {
  DRAFT: { label: "Draft", variant: "category" },
  PENDING: { label: "In review", variant: "clay" },
  CHANGES_REQUESTED: { label: "Changes requested", variant: "clay" },
  SCHEDULED: { label: "Scheduled", variant: "clay" },
  PUBLISHED: { label: "Published", variant: "sage" },
  ARCHIVED: { label: "Archived", variant: "category" },
}

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export default async function MyArticlesPage() {
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/journal/mine")}`)

  const profile = await db.editorProfile.findUnique({
    where: { userId },
    include: {
      articles: {
        orderBy: { updatedAt: "desc" },
        include: {
          category: { select: { name: true, nameAr: true } },
          reviews: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
  })

  const articles = profile?.articles ?? []

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl font-semibold text-foreground">My articles</h1>
        <Button asChild variant="soft">
          <Link href="/journal/submit">
            <PenLine className="mr-1.5 h-4 w-4" />
            Write a new one
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-stone bg-paper p-8 text-center text-sm text-muted-foreground">
          You haven&apos;t written anything yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-4">
          {articles.map((article) => {
            const status = STATUS_LABEL[article.status]
            const review = article.reviews[0]
            const canEdit =
              article.status === "DRAFT" || article.status === "CHANGES_REQUESTED"

            return (
              <li
                key={article.id}
                className="overflow-hidden rounded-2xl border border-beige bg-card"
              >
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
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {article.category && (
                        <span className="text-xs text-muted-foreground">
                          {article.category.name}
                        </span>
                      )}
                      {article.proposedCategory && (
                        <span className="text-xs text-muted-foreground">
                          proposed: {article.proposedCategory}
                        </span>
                      )}
                    </div>

                    <h2
                      {...langAttrs(article.title)}
                      className="bidi-plaintext mt-2 font-serif text-lg font-semibold text-foreground"
                    >
                      {article.title}
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {article.status === "SCHEDULED" && article.publishedAt
                        ? `Goes live ${dateFormat.format(article.publishedAt)}`
                        : article.publishedAt
                          ? `Published ${dateFormat.format(article.publishedAt)}`
                          : `Last edited ${dateFormat.format(article.updatedAt)}`}
                      {article.status === "PUBLISHED" &&
                        ` · ${article.viewCount} ${article.viewCount === 1 ? "view" : "views"}`}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {canEdit && (
                        <Button asChild size="sm" variant="soft">
                          <Link href={`/journal/submit/${article.id}`}>
                            {article.status === "CHANGES_REQUESTED" ? "Fix and resubmit" : "Continue editing"}
                          </Link>
                        </Button>
                      )}
                      {article.status === "PUBLISHED" && (
                        <Button asChild size="sm" variant="default">
                          <Link href={`/journal/${article.slug}`}>View</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {review && review.decision === "CHANGES_REQUESTED" && (
                  <div
                    dir="rtl"
                    lang="ar"
                    className="border-t border-beige bg-destructive/5 px-4 py-3"
                  >
                    <p className="text-xs font-semibold text-foreground">ملاحظات المراجعة</p>
                    {review.reasons.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-foreground">
                        {review.reasons.map((code) => (
                          <li key={code}>{REVIEW_REASON_BY_CODE.get(code)?.ar ?? code}</li>
                        ))}
                      </ul>
                    )}
                    {review.note && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-foreground">
                        {review.note}
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
