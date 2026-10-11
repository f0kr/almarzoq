import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendArticlePublishedEmail } from "@/lib/email"

/**
 * Reconciles scheduled articles, and tells their authors they are live.
 *
 * This is NOT what makes an article public. Readers get it from
 * `liveArticleWhere()` the moment `publishedAt` passes, so an article appears
 * at its exact scheduled minute even though Vercel's Hobby plan allows only one
 * cron run per day. All this does is flip the stored status so the dashboards
 * and the data agree, and send the "your article is live" email.
 *
 * Consequence of the daily schedule: that email can arrive up to a day after
 * the article went live. The approval email already told the author the date,
 * so nobody is left uninformed — but it is why the email is sent from here
 * rather than being the thing readers depend on.
 *
 * Authenticated by CRON_SECRET, not by a session: Vercel Cron sends
 * `Authorization: Bearer $CRON_SECRET` automatically when that env var is set.
 * The route is exempt from the session gate in middleware.ts for the same
 * reason the UploadThing callback is — it authenticates itself.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET

  // Refuse to run unauthenticated rather than fall open: without the secret
  // configured, anyone could trigger publication.
  if (!secret) {
    console.log("[CRON_PUBLISH] CRON_SECRET is not set; refusing to run")
    return new NextResponse("CRON_SECRET not configured", { status: 500 })
  }

  const authorization = req.headers.get("authorization")
  if (authorization !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const now = new Date()

    const due = await db.article.findMany({
      where: { status: "SCHEDULED", publishedAt: { lte: now } },
      select: {
        id: true,
        title: true,
        slug: true,
        author: { select: { user: { select: { email: true } } } },
      },
    })

    if (due.length === 0) {
      return NextResponse.json({ published: 0, at: now.toISOString() })
    }

    // publishedAt already holds the intended time and is what the public pages
    // display, so it is deliberately left alone — only the status moves.
    // Readers have been seeing these since their time passed.
    const { count } = await db.article.updateMany({
      where: { id: { in: due.map((article) => article.id) } },
      data: { status: "PUBLISHED" },
    })

    for (const article of due) {
      const email = article.author.user.email
      if (!email) continue
      await sendArticlePublishedEmail({
        to: email,
        articleTitle: article.title,
        slug: article.slug,
      })
    }

    console.log(`[CRON_PUBLISH] published ${count} article(s)`)

    return NextResponse.json({
      published: count,
      at: now.toISOString(),
      slugs: due.map((article) => article.slug),
    })
  } catch (error) {
    console.log("[CRON_PUBLISH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
