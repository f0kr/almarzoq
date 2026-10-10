import { redirect } from "next/navigation"
import type { ArticleStatus } from "@prisma/client"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import {
  ArticleReviewCard,
  type ReviewArticle,
} from "./_components/ArticleReviewCard"

/** Queue order: what needs a decision first, then what is already settled. */
const SECTIONS: { status: ArticleStatus; title: string; blurb: string }[] = [
  { status: "PENDING", title: "Waiting for review", blurb: "Submitted and untouched." },
  { status: "SCHEDULED", title: "Scheduled", blurb: "Approved, waiting for their date." },
  { status: "CHANGES_REQUESTED", title: "Sent back", blurb: "With the author to fix." },
  { status: "PUBLISHED", title: "Published", blurb: "Live in the journal." },
  { status: "ARCHIVED", title: "Taken down", blurb: "Removed after publication." },
]

export default async function TeacherJournalPage() {
  const { userId } = await auth()
  if (!userId || !isTeacher(userId)) return redirect("/")

  const [articles, categories, teachers] = await Promise.all([
    db.article.findMany({
      // Drafts are private to their author until submitted.
      where: { status: { not: "DRAFT" } },
      orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
      include: {
        author: { select: { displayName: true, avatarUrl: true, teacherId: true } },
        category: { select: { name: true } },
        resources: { orderBy: { position: "asc" }, select: { label: true, url: true } },
      },
    }),
    db.journalCategory.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    db.teacher.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  const rows: (ReviewArticle & { status: ArticleStatus })[] = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverUrl: article.coverUrl,
    contentHtml: article.contentHtml,
    status: article.status,
    readingMinutes: article.readingMinutes,
    submittedAt: article.submittedAt?.toISOString() ?? null,
    publishedAt: article.publishedAt?.toISOString() ?? null,
    categoryId: article.categoryId,
    categoryName: article.category?.name ?? null,
    proposedCategory: article.proposedCategory,
    authorName: article.author.displayName,
    authorAvatar: article.author.avatarUrl,
    authorTeacherId: article.author.teacherId,
    resources: article.resources,
  }))

  const pendingCount = rows.filter((row) => row.status === "PENDING").length

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="font-serif font-semibold text-2xl md:text-[28px]">Journal queue</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {pendingCount === 0
            ? "Nothing is waiting for a decision."
            : `${pendingCount} article${pendingCount === 1 ? "" : "s"} waiting for a decision.`}
        </p>
      </div>

      {SECTIONS.map((section) => {
        const sectionRows = rows.filter((row) => row.status === section.status)
        if (sectionRows.length === 0) return null

        return (
          <section key={section.status}>
            <h2 className="font-serif text-lg font-semibold">
              {section.title}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {sectionRows.length} · {section.blurb}
              </span>
            </h2>
            <ul className="mt-3 space-y-3">
              {sectionRows.map((row) => (
                <ArticleReviewCard
                  key={row.id}
                  article={row}
                  categories={categories}
                  teachers={teachers}
                />
              ))}
            </ul>
          </section>
        )
      })}

      {rows.length === 0 && (
        <p className="rounded-2xl border border-dashed border-stone bg-paper p-8 text-center text-sm text-muted-foreground">
          No submissions yet.
        </p>
      )}
    </div>
  )
}
