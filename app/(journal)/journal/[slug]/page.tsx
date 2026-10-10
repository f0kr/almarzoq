import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, Eye, Facebook, Globe, Instagram, Link2 } from "lucide-react"

import { AuthorAvatar } from "@/components/journal/AuthorAvatar"
import { CoverImage } from "@/components/journal/CoverImage"
import { ShareStory } from "@/components/journal/ShareStory"
import { ViewPing } from "@/components/journal/ViewPing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { detectLang, langAttrs } from "@/lib/lang"

const BASE_URL = "https://www.almrzoq.academy"

const dateFormat = new Intl.DateTimeFormat("ar", { dateStyle: "long" })

/** Only a live article is readable; a scheduled one must 404 until its date. */
async function getPublishedArticle(slug: string) {
  return db.article.findFirst({
    where: { slug: decodeURIComponent(slug), status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: {
      author: true,
      category: true,
      resources: { orderBy: { position: "asc" } },
    },
  })
}

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>): Promise<Metadata> {
  const { slug } = await params
  const article = await getPublishedArticle(slug)

  if (!article) {
    return { title: "Article not found", robots: { index: false, follow: false } }
  }

  const description = article.excerpt ?? undefined
  const path = `/journal/${article.slug}`

  return {
    title: article.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: article.title,
      description,
      url: path,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author.displayName],
      images: article.coverUrl ? [{ url: article.coverUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
  }
}

export default async function ArticlePage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params
  const article = await getPublishedArticle(slug)

  if (!article) notFound()

  const { author } = article

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    inLanguage: detectLang(article.title),
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    image: article.coverUrl || undefined,
    url: `${BASE_URL}/journal/${article.slug}`,
    author: {
      "@type": "Person",
      name: author.displayName,
      ...(author.teacherId ? { url: `${BASE_URL}/masters/${author.teacherId}` } : {}),
    },
    publisher: {
      "@type": "EducationalOrganization",
      name: "Almrzoq Academy",
      url: BASE_URL,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewPing articleId={article.id} />

      <article className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/journal">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            All articles
          </Link>
        </Button>

        {article.category && (
          <Badge variant="clay">{article.category.nameAr ?? article.category.name}</Badge>
        )}

        <h1
          {...langAttrs(article.title)}
          className="bidi-plaintext mt-3 break-words font-serif text-3xl font-semibold leading-tight text-foreground md:text-4xl"
        >
          {article.title}
        </h1>

        {/* Byline */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-beige py-4">
          <AuthorAvatar name={author.displayName} avatarUrl={author.avatarUrl} size={44} />

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">
              {author.teacherId ? (
                <Link
                  href={`/masters/${author.teacherId}`}
                  className="hover:text-clay hover:underline"
                >
                  {author.displayName}
                </Link>
              ) : (
                author.displayName
              )}
              {author.teacherId && (
                <Badge variant="sage" className="ml-2 text-[10px]">
                  Academy master
                </Badge>
              )}
            </p>
            <p dir="rtl" className="text-xs text-muted-foreground">
              {article.publishedAt && dateFormat.format(article.publishedAt)}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {author.instagram && (
              <Button asChild size="icon" variant="ghost" aria-label="Instagram">
                <a href={author.instagram} target="_blank" rel="noopener noreferrer nofollow">
                  <Instagram className="h-4 w-4" />
                </a>
              </Button>
            )}
            {author.facebook && (
              <Button asChild size="icon" variant="ghost" aria-label="Facebook">
                <a href={author.facebook} target="_blank" rel="noopener noreferrer nofollow">
                  <Facebook className="h-4 w-4" />
                </a>
              </Button>
            )}
            {author.website && (
              <Button asChild size="icon" variant="ghost" aria-label="Website">
                <a href={author.website} target="_blank" rel="noopener noreferrer nofollow">
                  <Globe className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          <div className="flex w-full items-center gap-3 text-xs text-muted-foreground sm:w-auto">
            {article.readingMinutes && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readingMinutes} min
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {article.viewCount}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <ShareStory
            title={article.title}
            storyUrl={`/api/og/journal/${encodeURIComponent(article.slug)}?v=${article.updatedAt.getTime().toString(36)}`}
          />
        </div>

        {article.coverUrl && (
          <CoverImage
            src={article.coverUrl}
            className="mt-6 aspect-[4/3] rounded-2xl sm:aspect-video"
            sizes="(max-width:768px) 100vw, 768px"
            priority
          />
        )}

        {/* Body. Sanitised on write in lib/journal/sanitize.ts — the stored HTML
            has already been through the allow-list. */}
        <div
          dir="rtl"
          lang="ar"
          className="prose-article mt-8"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />

        {article.resources.length > 0 && (
          <section dir="rtl" lang="ar" className="mt-10 rounded-2xl border border-beige bg-paper p-5">
            <h2 className="font-serif text-lg font-semibold text-foreground">المصادر</h2>
            <ul className="mt-3 space-y-2">
              {article.resources.map((resource) => (
                <li key={resource.id} className="flex items-start gap-2 text-sm">
                  <Link2 className="mt-1 h-3.5 w-3.5 shrink-0 text-clay" />
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-clay underline underline-offset-4"
                  >
                    {resource.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {author.bio && (
          <section className="mt-8 flex gap-4 rounded-2xl border border-beige bg-card p-5">
            <AuthorAvatar name={author.displayName} avatarUrl={author.avatarUrl} size={52} />
            <div>
              <p className="font-semibold text-foreground">{author.displayName}</p>
              <p dir="rtl" lang="ar" className="bidi-plaintext mt-1 text-sm leading-7 text-muted-foreground">
                {author.bio}
              </p>
            </div>
          </section>
        )}
      </article>
    </>
  )
}
