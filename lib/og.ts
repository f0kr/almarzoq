/**
 * Helpers for the generated Open Graph cards.
 *
 * Chapter cards are drawn by satori (`next/og`), which shapes Arabic glyphs
 * correctly but lays the pieces of a run out left-to-right — it has no bidi
 * reordering. Since this catalog's titles are mostly Arabic, the card renderer
 * depends on `bindArabicRuns` to compensate. Its output was checked against
 * Pango (HarfBuzz + FriBidi) on the real titles in the database.
 */

import { hasArabic } from "@/lib/lang"

/** satori does not break a run on this, unlike a plain space. */
const NBSP = " "

/** Strip Quill markup down to a single line of prose. */
export const plainText = (html?: string | null) =>
  (html ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

/** Clip to `max` characters on a word boundary, with an ellipsis. */
export function truncate(text: string, max: number) {
  if (text.length <= max) return text
  const clipped = text.slice(0, max)
  const lastSpace = clipped.lastIndexOf(" ")
  return `${(lastSpace > max * 0.6 ? clipped.slice(0, lastSpace) : clipped).trim()}…`
}

/**
 * Rewrite the Arabic in a string so satori paints it right-to-left.
 *
 * Latin runs are left alone, so a bilingual title like
 * "Drawing basics-كورس أساسيات الرسم" keeps its halves in the right places.
 * See `layoutRun` for what each Arabic run gets and why.
 *
 * The cost is that a run can no longer wrap, so callers must break text into
 * lines first (see `wrapTitle`) and pass each line through separately.
 *
 * Only for text handed to satori. Never use it for text the browser renders,
 * or on anything stored — the browser does real bidi and would double-reverse.
 */
export function bindArabicRuns(text: string) {
  type Kind = "ar" | "ltr" | "neutral"

  // Titles in this catalog butt the scripts together without a space
  // ("Drawing basics-كورس أساسيات الرسم"), so runs are found per character
  // rather than per word — splitting on whitespace would strand "basics-" at
  // the far end of the reversed run.
  const kindOf = (char: string): Kind =>
    hasArabic(char) ? "ar" : /[\s\d\p{P}\p{S}]/u.test(char) ? "neutral" : "ltr"

  // 1. Collapse the string into atoms of a single kind.
  const atoms: { kind: Kind; text: string }[] = []
  for (const char of text) {
    const kind = kindOf(char)
    const last = atoms[atoms.length - 1]
    if (last?.kind === kind) last.text += char
    else atoms.push({ kind, text: char })
  }

  // 2. A neutral atom joins the Arabic run only when Arabic sits on both
  //    sides — the "-" between "basics" and "كورس" belongs to the Latin side,
  //    which is how bidi resolves a neutral between L and R under an LTR base.
  const isArabicRun = atoms.map((atom, i) => {
    if (atom.kind === "ar") return true
    if (atom.kind !== "neutral") return false
    return atoms[i - 1]?.kind === "ar" && atoms[i + 1]?.kind === "ar"
  })

  // 3. Merge the neighbouring pieces into whole runs, then lay each one out
  //    the way satori has to receive it. Merging first matters: a run has to
  //    be reordered as a unit, not one word at a time.
  let out = ""
  for (let i = 0; i < atoms.length; ) {
    if (!isArabicRun[i]) {
      out += atoms[i].text
      i += 1
      continue
    }
    let end = i
    while (end < atoms.length && isArabicRun[end]) end += 1
    out += layoutRun(
      atoms
        .slice(i, end)
        .map((atom) => atom.text)
        .join(""),
    )
    i = end
  }

  return out
}

/**
 * Turn one Arabic run into the source order satori needs to paint it RTL.
 *
 * satori breaks a run wherever a non-Arabic character appears and then places
 * the pieces left-to-right. Two things follow:
 *
 *   - Plain spaces break it, so they become non-breaking spaces, which don't.
 *     (That also fixes the word gap, which satori otherwise renders ~3x wide.)
 *   - Punctuation still breaks it — "مسن - بتقنية" comes out with the halves
 *     swapped — so the pieces are pre-reversed to cancel that out.
 */
function layoutRun(run: string) {
  const bound = run.replace(/ /g, NBSP)

  // Split into text satori keeps together vs. the punctuation that breaks it.
  const pieces: { text: string; breaks: boolean }[] = []
  for (const char of bound) {
    const breaks = !hasArabic(char) && char !== NBSP
    const last = pieces[pieces.length - 1]
    if (last?.breaks === breaks) last.text += char
    else pieces.push({ text: char, breaks })
  }

  // Hand the hard spaces flanking a separator to the separator itself, so the
  // gaps stay put once the order flips.
  for (let i = 0; i < pieces.length; i += 1) {
    if (!pieces[i].breaks) continue
    const before = pieces[i - 1]
    const after = pieces[i + 1]
    if (before?.text.endsWith(NBSP)) {
      before.text = before.text.slice(0, -1)
      pieces[i].text = NBSP + pieces[i].text
    }
    if (after?.text.startsWith(NBSP)) {
      after.text = after.text.slice(1)
      pieces[i].text += NBSP
    }
  }

  return pieces
    .reverse()
    .map((piece) => piece.text)
    .join("")
}

/**
 * Greedy word wrap, needed because `bindArabicRuns` suppresses satori's own
 * wrapping. `maxChars` is a proxy for width — good enough here because chapter
 * titles are short (the catalog's longest is 39 characters) and the card
 * chooses a font size to match.
 */
export function wrapTitle(text: string, maxChars: number, maxLines = 2) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []

  for (const word of words) {
    const current = lines[lines.length - 1]
    if (current && current.length + 1 + word.length <= maxChars) {
      lines[lines.length - 1] = `${current} ${word}`
    } else if (lines.length < maxLines) {
      lines.push(word)
    } else {
      // Out of lines — let the last one run long rather than dropping words.
      lines[lines.length - 1] = `${current} ${word}`
    }
  }

  return lines.length ? lines : [text]
}

/**
 * Frame from a Mux asset, sized for an OG card.
 *
 * Free with the `public` playback policy the chapter upload route sets, so no
 * signing is involved. Without `time` Mux serves the midpoint of the asset,
 * which beats a fixed early offset — lessons tend to open on a title card or a
 * black frame.
 */
export function muxThumbnailUrl(playbackId: string, width = 1200, height = 630) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}&height=${height}&fit_mode=smartcrop`
}

/**
 * URL of a chapter's generated card.
 *
 * `v` is the chapter's `updatedAt`: scrapers cache OG images hard against the
 * URL, so a re-uploaded video or a retitled lesson needs a new one to shake
 * the old preview loose.
 */
export function chapterOgImageUrl(chapterId: string, updatedAt: Date) {
  return `/api/og/chapter/${chapterId}?v=${updatedAt.getTime().toString(36)}`
}
