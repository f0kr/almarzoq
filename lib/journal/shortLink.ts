/**
 * Short links for the story card.
 *
 * An article's real URL carries an Arabic slug, which percent-encodes into
 * something far too long to print on a card or type from a phone screen. The
 * first 8 hex characters of the uuid are short, unambiguous to read aloud, and
 * stable for the article's life — no extra column, no second id to keep in sync.
 *
 * 8 hex characters is 4.3 billion values; a collision needs the journal to hold
 * tens of thousands of articles before it is even worth thinking about, and the
 * resolver refuses an ambiguous prefix rather than guessing.
 */

export const SHORT_CODE_LENGTH = 8

export function shortCode(articleId: string): string {
  return articleId.replace(/-/g, "").slice(0, SHORT_CODE_LENGTH)
}

export function shortPath(articleId: string): string {
  return `/j/${shortCode(articleId)}`
}
