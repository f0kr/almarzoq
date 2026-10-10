/**
 * Shared parsing for the two write paths into an article (create and update),
 * so a rule can't drift between them. Everything here runs on the server: the
 * form validates too, but only to tell the writer sooner.
 */

import {
  buildExcerpt,
  htmlToPlainText,
  readingMinutes,
  sanitizeArticleHtml,
} from "@/lib/journal/sanitize"

export const MIN_TITLE_LENGTH = 6
/** Roughly a paragraph. Below this it isn't an article, and the queue fills with noise. */
export const MIN_BODY_LENGTH = 200

export type ResourceInput = { label: string; url: string }

export type ParsedArticle = {
  title: string
  coverUrl: string | null
  coverKey: string | null
  categoryId: string | null
  proposedCategory: string | null
  contentHtml: string
  contentText: string
  excerpt: string
  readingMinutes: number
  resources: ResourceInput[]
  author: {
    displayName: string
    avatarUrl: string | null
    bio: string | null
    instagram: string | null
    facebook: string | null
    website: string | null
    teacherId: string | null
  }
}

const HTTP_URL = /^https?:\/\//i

/** Accepts a full URL or a bare handle; returns a URL or null. */
function socialUrl(input: unknown, host: string): string | null {
  if (typeof input !== "string") return null
  const value = input.trim()
  if (!value) return null

  if (HTTP_URL.test(value)) {
    try {
      const url = new URL(value)
      return url.hostname.endsWith(host) ? url.toString() : null
    } catch {
      return null
    }
  }

  const handle = value.replace(/^@/, "").replace(/[^A-Za-z0-9._-]/g, "")
  return handle ? `https://${host}/${handle}` : null
}

function plainUrl(input: unknown): string | null {
  if (typeof input !== "string") return null
  const value = input.trim()
  if (!value || !HTTP_URL.test(value)) return null
  try {
    return new URL(value).toString()
  } catch {
    return null
  }
}

function trimmedOrNull(input: unknown, max: number): string | null {
  if (typeof input !== "string") return null
  const value = input.trim()
  return value ? value.slice(0, max) : null
}

export function parseArticleInput(
  body: Record<string, unknown>
): { error: string } | { data: ParsedArticle } {
  const title = typeof body.title === "string" ? body.title.trim() : ""
  if (title.length < MIN_TITLE_LENGTH) {
    return { error: `Title is too short (at least ${MIN_TITLE_LENGTH} characters)` }
  }

  const contentHtml = sanitizeArticleHtml(
    typeof body.contentHtml === "string" ? body.contentHtml : ""
  )
  const contentText = htmlToPlainText(contentHtml)
  if (contentText.length < MIN_BODY_LENGTH) {
    return { error: `Article body is too short (at least ${MIN_BODY_LENGTH} characters)` }
  }

  const categoryId = trimmedOrNull(body.categoryId, 64)
  const proposedCategory = trimmedOrNull(body.proposedCategory, 60)
  if (!categoryId && !proposedCategory) {
    return { error: "Choose a category for the article" }
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : ""
  if (displayName.length < 2) {
    return { error: "Enter the name to show on the article" }
  }

  const rawResources = Array.isArray(body.resources) ? body.resources : []
  const resources: ResourceInput[] = rawResources
    .slice(0, 20)
    .map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>
      const url = plainUrl(row.url)
      const label = trimmedOrNull(row.label, 120)
      return url ? { url, label: label ?? url } : null
    })
    .filter((row): row is ResourceInput => row !== null)

  return {
    data: {
      title: title.slice(0, 180),
      coverUrl: plainUrl(body.coverUrl),
      coverKey: trimmedOrNull(body.coverKey, 200),
      // A proposed category only means anything when no real one was picked.
      categoryId,
      proposedCategory: categoryId ? null : proposedCategory,
      contentHtml,
      contentText,
      excerpt: buildExcerpt(contentText),
      readingMinutes: readingMinutes(contentText),
      resources,
      author: {
        displayName: displayName.slice(0, 80),
        avatarUrl: plainUrl(body.avatarUrl),
        bio: trimmedOrNull(body.bio, 600),
        instagram: socialUrl(body.instagram, "instagram.com"),
        facebook: socialUrl(body.facebook, "facebook.com"),
        website: plainUrl(body.website),
        teacherId: trimmedOrNull(body.teacherId, 64),
      },
    },
  }
}
