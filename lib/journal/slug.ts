/**
 * URL slugs for journal content.
 *
 * Titles are written in Arabic, so slugs keep the Arabic letters rather than
 * transliterating them: browsers percent-encode the URL, search engines index
 * it fine, and the author recognises their own title. Transliteration would be
 * lossy and unreadable to the audience this journal is for.
 *
 * Diacritics (tashkeel) are stripped so that "مَقال" and "مقال" don't produce
 * two different slugs for what readers consider the same word.
 */

const ARABIC_DIACRITICS = /[ً-ٰٟۖ-ۭ]/g
const NON_WORD = /[^\p{Letter}\p{Number}]+/gu
const TRIM_DASHES = /^-+|-+$/g

const MAX_LENGTH = 80

export function slugify(input: string): string {
  const slug = input
    .normalize("NFKC")
    .replace(ARABIC_DIACRITICS, "")
    .toLowerCase()
    .replace(NON_WORD, "-")
    .replace(TRIM_DASHES, "")
    .slice(0, MAX_LENGTH)
    .replace(TRIM_DASHES, "")

  return slug || "item"
}

/**
 * `slugify` plus a numeric suffix until `isTaken` says the slug is free.
 * Caller supplies the lookup so this works for any model — and can exclude the
 * row being renamed, so re-saving a category without changing its name doesn't
 * push it to "design-2".
 */
export async function uniqueSlug(
  input: string,
  isTaken: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(input)

  if (!(await isTaken(base))) return base

  for (let suffix = 2; suffix < 500; suffix++) {
    const candidate = `${base}-${suffix}`
    if (!(await isTaken(candidate))) return candidate
  }

  // Pathological case only: fall back to something guaranteed free.
  return `${base}-${Date.now()}`
}
