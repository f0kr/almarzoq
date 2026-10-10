import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { Clock, Eye, PenLine } from "lucide-react"

import { AuthorAvatar } from "@/components/journal/AuthorAvatar"
import { CoverImage } from "@/components/journal/CoverImage"
import { JournalFilters } from "@/components/journal/JournalFilters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getArticles, getJournalEditors } from "@/actions/getArticles"
import { db } from "@/lib/db"
import { langAttrs } from "@/lib/lang"

export const metadata: Metadata = {
  title: "Journal",
  description:
    "مقالات يكتبها فنانون ومتعلمون في أكاديمية المرزوق عن الرسم والتصوير والفن الرقمي — Articles on drawing, painting and digital art from the Almrzoq Academy community.",
  alternates: { canonical: "/journal" },
  openGraph: { title: "Almrzoq Journal", url: "/journal", type: "website" },
}

const dateFormat = new Intl.DateTimeFormat("ar", { dateStyle: "long" })

export default async function JournalPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    q?: string
    categoryId?: string
    editorId?: string
    from?: string
    to?: string
  }>
}>) {
  const sp = await searchParams

  const [articles, categories, editors] = await Promise.all([
    getArticles({
      q: sp.q,
      categoryId: sp.categoryId,
      editorId: sp.editorId,
      from: sp.from,
      to: sp.to,
    }),
    db.journalCategory.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, nameAr: true },
    }),
    getJournalEditors(),
  ])

  const filtered = Boolean(sp.q || sp.categoryId || sp.editorId || sp.from || sp.to)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
            The Journal
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Writing from the academy&apos;s community — on technique, materials, and the
            practice of making art.
          </p>
        </div>
        <Button asChild variant="soft">
          <Link href="/journal/submit">
            <PenLine className="mr-1.5 h-4 w-4" />
            Write an article
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-24" />}>
          <JournalFilters categories={categories} editors={editors} />
        </Suspense>
      </div>

      {articles.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-stone bg-paper p-10 text-center text-sm text-muted-foreground">
          {filtered
            ? "No articles match these filters."
            : "No articles published yet — yours could be the first."}
        </p>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted-foreground">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </p>
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/journal/${article.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-beige bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CoverImage
                    src={article.coverUrl}
                    className="aspect-[16/10]"
                    sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 340px"
                  >
                    {article.category && (
                      <Badge
                        variant="category"
                        className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate"
                      >
                        {article.category.nameAr ?? article.category.name}
                      </Badge>
                    )}
                  </CoverImage>

                  <div className="flex flex-1 flex-col p-4">
                    <h2
                      {...langAttrs(article.title)}
                      className="bidi-plaintext break-words font-serif text-lg font-semibold leading-snug text-foreground group-hover:text-clay"
                    >
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p
                        dir="rtl"
                        lang="ar"
                        className="bidi-plaintext mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground"
                      >
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex items-center gap-2 border-t border-beige pt-3">
                      <AuthorAvatar
                        name={article.author.displayName}
                        avatarUrl={article.author.avatarUrl}
                        size={28}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
                        {article.author.displayName}
                      </span>
                      {article.readingMinutes && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {article.readingMinutes}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {article.viewCount}
                      </span>
                    </div>

                    {article.publishedAt && (
                      <p dir="rtl" className="mt-1 text-[11px] text-muted-foreground">
                        {dateFormat.format(article.publishedAt)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
