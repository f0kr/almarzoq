import axios from "axios"

/**
 * The message to show a user for a failed API call.
 *
 * Our routes answer with a short plain-text sentence, which is worth showing
 * verbatim. But a crash *outside* the route's own try/catch — a module that
 * fails to load, say — gets answered by Next with a full HTML error page, and
 * `typeof data === "string"` is true for that too. Painting it into a toast
 * dumps an entire document on the reader, which is what used to happen here.
 *
 * So the response body is only trusted when it actually looks like a message.
 */
const MAX_MESSAGE_LENGTH = 200

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback

  const data = error.response?.data
  if (typeof data !== "string") return fallback

  const message = data.trim()
  if (!message) return fallback
  // Markup, or anything long enough to be a document rather than a sentence.
  if (message.startsWith("<") || message.length > MAX_MESSAGE_LENGTH) return fallback
  if (message.includes("\n")) return fallback

  return message
}
