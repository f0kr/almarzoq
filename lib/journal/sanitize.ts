/**
 * Article HTML is written by visitors and rendered to every reader, so it is
 * untrusted input on a stored-XSS path. Everything saved to `Article.contentHtml`
 * goes through `sanitizeArticleHtml` first, server-side — never only in the
 * browser, where an attacker simply skips the editor and posts to the API.
 */

import DOMPurify from "isomorphic-dompurify"

/** What the Tiptap toolbar can actually produce, and nothing more. */
const ALLOWED_TAGS = [
  "p", "br", "hr",
  "strong", "em", "u", "s", "code", "pre",
  "h2", "h3", "h4",
  "ul", "ol", "li",
  "blockquote",
  "a",
  "img", "figure", "figcaption",
]

const ALLOWED_ATTR = ["href", "title", "target", "rel", "src", "alt", "width", "height", "style", "dir"]

/** Inline styles are narrowed to this one declaration — see the hook below. */
const TEXT_ALIGN = /^text-align:\s*(left|right|center|justify)$/i

let hooksRegistered = false

function registerHooks() {
  if (hooksRegistered) return
  hooksRegistered = true

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    const el = node as unknown as Element
    if (typeof el.getAttribute !== "function") return

    // Outbound links open away from the journal and carry no referrer or
    // ranking signal — this is user-submitted content.
    if (el.tagName === "A") {
      el.setAttribute("target", "_blank")
      el.setAttribute("rel", "noopener noreferrer nofollow ugc")
    }

    // Images must be real uploads. A data: URI here would mean a multi-megabyte
    // base64 blob inlined into a database column.
    if (el.tagName === "IMG") {
      const src = el.getAttribute("src") ?? ""
      if (!/^https?:\/\//i.test(src)) el.removeAttribute("src")
      if (!el.getAttribute("alt")) el.setAttribute("alt", "")
    }

    // `style` exists only so TextAlign works. Anything else is dropped rather
    // than trusted to DOMPurify's CSS pass.
    const style = el.getAttribute("style")
    if (style !== null) {
      const kept = style
        .split(";")
        .map((rule) => rule.trim())
        .filter((rule) => TEXT_ALIGN.test(rule))
      if (kept.length) el.setAttribute("style", `${kept.join("; ")};`)
      else el.removeAttribute("style")
    }
  })
}

export function sanitizeArticleHtml(dirty: string): string {
  registerHooks()
  return DOMPurify.sanitize(dirty ?? "", {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Plain-text mirror of the body: what the search indexes and the excerpt is
 * cut from. Deliberately not `plainText` from lib/og.ts — that one is tuned for
 * a single-line OG title and would run "...end.</p><p>Next..." together into
 * one word. Block boundaries become spaces here.
 */
// `a` is in here with the block tags: two adjacent links otherwise merge
// into one nonsense token ("رابط خبيثرابط سليم"), which poisons both the
// search index and the excerpt.
const BLOCK_END = /<\/(p|div|h[1-6]|li|blockquote|figcaption|pre|tr|a)>/gi
const TAG = /<[^>]*>/g

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
}

export function htmlToPlainText(html: string): string {
  return (html ?? "")
    .replace(BLOCK_END, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(TAG, "")
    .replace(/&[a-z#0-9]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
    .replace(/\s+/g, " ")
    .trim()
}

export function buildExcerpt(text: string, max = 180): string {
  if (text.length <= max) return text
  const clipped = text.slice(0, max)
  const lastSpace = clipped.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim()}…`
}

/**
 * Arabic prose is read more slowly than English — 180 wpm is the figure used
 * for Modern Standard Arabic, against ~230 for English.
 */
const WORDS_PER_MINUTE = 180

export function readingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
