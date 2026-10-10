import Fuse from "fuse.js"
import { db } from "@/lib/db"

export type ArticleCard = {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  publishedAt: Date | null
  readingMinutes: number | null
  viewCount: number
  category: { id: string; name: string; nameAr: string | null } | null
  author: { id: string; displayName: string; avatarUrl: string | null }
}

type GetArticles = {
  q?: string
  categoryId?: string
  editorId?: string
  /** ISO dates, inclusive. */
  from?: string
  to?: string
}

/**
 * Published articles for the public journal.
 *
 * Search is Fuse over the loaded rows rather than a SQL `contains`, for the
 * same reason actions/getCourses.ts does it: `contains` is case-sensitive and
 * does nothing useful for Arabic, while Fuse is script-agnostic and
 * typo-tolerant. Worth moving to Postgres full-text (the preview feature is
 * already enabled in schema.prisma) once the journal passes a few hundred
 * articles — until then this is one indexed query and an in-memory sort.
 */
export async function getArticles({
  q,
  categoryId,
  editorId,
  from,
  to,
}: GetArticles): Promise<ArticleCard[]> {
  try {
    const publishedAt: { gte?: Date; lte?: Date; lte_now?: never } = {}
    if (from) {
      const date = new Date(from)
      if (!Number.isNaN(date.getTime())) publishedAt.gte = date
    }
    if (to) {
      const date = new Date(to)
      if (!Number.isNaN(date.getTime())) {
        // `to` is a day, and the reader means the end of it.
        date.setHours(23, 59, 59, 999)
        publishedAt.lte = date
      }
    }

    const articles = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        // Belt and braces with the cron: a row can never surface early.
        publishedAt: { ...publishedAt, lte: publishedAt.lte ?? new Date() },
        ...(categoryId ? { categoryId } : {}),
        ...(editorId ? { authorId: editorId } : {}),
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverUrl: true,
        publishedAt: true,
        readingMinutes: true,
        viewCount: true,
        contentText: true,
        category: { select: { id: true, name: true, nameAr: true } },
        author: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    })

    const query = q?.trim()
    if (!query) {
      return articles.map(({ contentText: _contentText, ...article }) => article)
    }

    const results = new Fuse(articles, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "excerpt", weight: 0.2 },
        { name: "author.displayName", weight: 0.2 },
        { name: "category.name", weight: 0.05 },
        { name: "category.nameAr", weight: 0.05 },
      ],
      threshold: 0.4,
      ignoreLocation: true,
    })
      .search(query)
      .map((result) => result.item)

    return results.map(({ contentText: _contentText, ...article }) => article)
  } catch (error) {
    console.log("[GET_ARTICLES]", error)
    return []
  }
}

/** The editors with at least one published article — powers the author filter. */
export async function getJournalEditors() {
  try {
    const editors = await db.editorProfile.findMany({
      where: { articles: { some: { status: "PUBLISHED" } } },
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true },
    })
    return editors
  } catch (error) {
    console.log("[GET_JOURNAL_EDITORS]", error)
    return []
  }
}
