/**
 * Article HTML is written by visitors and rendered to every reader, so it is
 * untrusted input on a stored-XSS path. Everything saved to `Article.contentHtml`
 * goes through `sanitizeArticleHtml` first, server-side — never only in the
 * browser, where an attacker simply skips the editor and posts to the API.
 *
 * Deliberately parser-based (htmlparser2) rather than DOM-based. The first
 * version used isomorphic-dompurify, which drags in jsdom; jsdom's dependency
 * chain does a CommonJS require() of an ESM-only package, which Vercel's Node
 * refuses, so the route failed to load in production with nothing thrown inside
 * the handler. A full DOM implementation was always overkill for an allow-list.
 */

import sanitizeHtml from "sanitize-html"

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

/** `style` exists only so TextAlign works — see allowedStyles below. */
const TEXT_ALIGN = /^(left|right|center|justify)$/

export function sanitizeArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty ?? "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["style", "dir"],
    },
    // http(s) only. This is what blocks javascript: hrefs, and data: URIs —
    // the latter would inline a multi-megabyte base64 blob into a database
    // column. Applied to href/src/cite by default.
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    // Narrowed to the one declaration the toolbar emits, rather than trusting
    // a general CSS sanitizer.
    allowedStyles: { "*": { "text-align": [TEXT_ALIGN] } },
    transformTags: {
      // Outbound links open away from the journal and carry no referrer or
      // ranking signal — this is user-submitted content.
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow ugc" },
      }),
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, alt: attribs.alt ?? "" },
      }),
    },
    // Drop these tags *with* their text. Without this the body of a <script>
    // survives as visible prose.
    nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe"],
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
