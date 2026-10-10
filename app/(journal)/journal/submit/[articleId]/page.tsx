import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"

import { ArticleForm } from "@/components/journal/ArticleForm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { REVIEW_REASON_BY_CODE } from "@/lib/journal/reviewReasons"

export const metadata: Metadata = {
  title: "Edit article",
  robots: { index: false, follow: false },
}

export default async function EditArticlePage({
  params,
}: Readonly<{ params: Promise<{ articleId: string }> }>) {
  const { articleId } = await params
  const { userId } = await auth()

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/journal/submit/${articleId}`)}`)
  }

  const article = await db.article.findUnique({
    where: { id: articleId },
    include: {
      author: true,
      resources: { orderBy: { position: "asc" } },
      reviews: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  if (!article || article.author.userId !== userId) notFound()

  // Matches the API's rule, so the page never offers an edit the server will
  // refuse.
  if (article.status !== "DRAFT" && article.status !== "CHANGES_REQUESTED") {
    redirect("/journal/mine")
  }

  const [categories, teachers] = await Promise.all([
    db.journalCategory.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, nameAr: true },
    }),
    db.teacher.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ])

  const lastReview = article.reviews[0]

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Edit article</h1>

      {lastReview && lastReview.decision === "CHANGES_REQUESTED" && (
        <section
          dir="rtl"
          lang="ar"
          className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-5"
        >
          <h2 className="font-serif text-lg font-semibold text-foreground">
            ملاحظات المراجعة
          </h2>
          {lastReview.reasons.length > 0 && (
            <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-foreground">
              {lastReview.reasons.map((code) => (
                <li key={code}>{REVIEW_REASON_BY_CODE.get(code)?.ar ?? code}</li>
              ))}
            </ul>
          )}
          {lastReview.note && (
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-foreground">
              {lastReview.note}
            </p>
          )}
        </section>
      )}

      <div className="mt-8">
        <ArticleForm
          categories={categories}
          teachers={teachers}
          initial={{
            id: article.id,
            title: article.title,
            coverUrl: article.coverUrl,
            coverKey: article.coverKey,
            categoryId: article.categoryId,
            proposedCategory: article.proposedCategory,
            contentHtml: article.contentHtml,
            resources: article.resources.map((r) => ({ label: r.label, url: r.url })),
            displayName: article.author.displayName,
            avatarUrl: article.author.avatarUrl,
            bio: article.author.bio,
            instagram: article.author.instagram,
            facebook: article.author.facebook,
            website: article.author.website,
            teacherId: article.author.teacherId,
          }}
        />
      </div>
    </main>
  )
}
