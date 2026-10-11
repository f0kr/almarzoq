import type { ArticleStatus } from "@prisma/client"

/**
 * What it means for an article to be live.
 *
 * Publication is decided by the clock, not by the cron. An article whose
 * `publishedAt` has arrived is readable immediately, whether or not anything
 * has got round to flipping its status to PUBLISHED.
 *
 * That matters because Vercel's Hobby plan allows one cron run per day: if the
 * status flip were the mechanism, an article scheduled for 3pm would stay
 * invisible until the next midnight. With this predicate the cron is only a
 * reconciler — it tidies statuses and sends the "your article is live" email,
 * and if it never ran at all, readers would not notice.
 *
 * ARCHIVED is deliberately absent: taking an article down is immediate.
 */
const LIVE_STATUSES: ArticleStatus[] = ["PUBLISHED", "SCHEDULED"]

/** Prisma `where` fragment for "readable by the public, right now". */
export function liveArticleWhere() {
  return {
    status: { in: LIVE_STATUSES },
    publishedAt: { lte: new Date() },
  }
}

/** The same rule for a row already in hand — used for status labels. */
export function isLive(article: {
  status: ArticleStatus
  publishedAt: Date | null
}): boolean {
  if (!LIVE_STATUSES.includes(article.status)) return false
  return Boolean(article.publishedAt && article.publishedAt.getTime() <= Date.now())
}

/**
 * The status to *show*. A scheduled article whose time has passed is live, and
 * calling it "Scheduled" in the dashboard would be a lie until the cron runs.
 */
export function displayStatus(article: {
  status: ArticleStatus
  publishedAt: Date | null
}): ArticleStatus {
  return article.status === "SCHEDULED" && isLive(article) ? "PUBLISHED" : article.status
}
