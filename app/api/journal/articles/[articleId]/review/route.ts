import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { REVIEW_REASON_BY_CODE } from "@/lib/journal/reviewReasons"
import {
  sendArticleApprovedEmail,
  sendArticleChangesRequestedEmail,
} from "@/lib/email"

/**
 * The admin's decision on a submission.
 *
 * Every call writes an ArticleReview row, so the author sees each round of
 * feedback rather than only the latest, and there is a record of who decided
 * what and when.
 */
export async function POST(
  req: Request,
  { params }: Readonly<{ params: Promise<{ articleId: string }> }>
) {
  try {
    const { userId } = await auth()
    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { articleId } = await params
    const body = (await req.json()) as Record<string, unknown>

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: { author: { select: { id: true, userId: true } } },
    })
    if (!article) return new NextResponse("Not Found", { status: 404 })

    const decision = body.decision
    if (decision !== "APPROVED" && decision !== "CHANGES_REQUESTED") {
      return new NextResponse("Unknown decision", { status: 400 })
    }

    // A draft has never been submitted, and an archived article is out of the
    // flow — neither is the reviewer's to decide on.
    if (article.status === "DRAFT" || article.status === "ARCHIVED") {
      return new NextResponse("This article is not awaiting review", { status: 409 })
    }

    const reasons = Array.isArray(body.reasons)
      ? body.reasons.filter(
          (code): code is string => typeof code === "string" && REVIEW_REASON_BY_CODE.has(code)
        )
      : []
    const note =
      typeof body.note === "string" && body.note.trim() ? body.note.trim().slice(0, 2000) : null

    if (decision === "CHANGES_REQUESTED" && reasons.length === 0 && !note) {
      return new NextResponse("Pick at least one reason, or write a note", { status: 400 })
    }

    // The admin resolves an "Other" proposal into a real category here.
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : null
    if (categoryId) {
      const category = await db.journalCategory.findUnique({
        where: { id: categoryId },
        select: { id: true },
      })
      if (!category) return new NextResponse("Unknown category", { status: 400 })
    }

    // And confirms (or clears) the author's self-claimed master profile.
    const teacherId =
      body.teacherId === null ? null : typeof body.teacherId === "string" ? body.teacherId : undefined

    let publishesAt = new Date()
    let scheduled = false

    if (decision === "APPROVED") {
      if (typeof body.publishAt === "string" && body.publishAt) {
        const when = new Date(body.publishAt)
        if (Number.isNaN(when.getTime())) {
          return new NextResponse("Invalid publish date", { status: 400 })
        }
        // A date in the past means "now" — scheduling backwards would leave the
        // article stranded as SCHEDULED with a time the cron has already passed.
        if (when.getTime() > Date.now()) {
          publishesAt = when
          scheduled = true
        }
      }

      if (!article.slug) {
        return new NextResponse("Article has no slug", { status: 500 })
      }
    }

    const updated = await db.$transaction(async (tx) => {
      await tx.articleReview.create({
        data: { articleId, reviewerId: userId, decision, reasons, note },
      })

      if (teacherId !== undefined) {
        await tx.editorProfile.update({
          where: { id: article.author.id },
          data: { teacherId },
        })
      }

      return tx.article.update({
        where: { id: articleId },
        data:
          decision === "APPROVED"
            ? {
                status: scheduled ? "SCHEDULED" : "PUBLISHED",
                publishedAt: publishesAt,
                ...(categoryId ? { categoryId, proposedCategory: null } : {}),
              }
            : { status: "CHANGES_REQUESTED" },
      })
    })

    // Notifying is best-effort: lib/email.ts swallows transport failures, and a
    // decision that is already committed must not 500 because Resend blinked.
    const authorUser = await db.user.findUnique({
      where: { id: article.author.userId },
      select: { email: true },
    })

    if (authorUser?.email) {
      if (decision === "APPROVED") {
        await sendArticleApprovedEmail({
          to: authorUser.email,
          articleTitle: updated.title,
          slug: updated.slug,
          publishesAt,
          scheduled,
        })
      } else {
        await sendArticleChangesRequestedEmail({
          to: authorUser.email,
          articleTitle: updated.title,
          articleId,
          reasons: reasons.map((code) => REVIEW_REASON_BY_CODE.get(code)?.ar ?? code),
          note,
        })
      }
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      publishedAt: updated.publishedAt,
    })
  } catch (error) {
    console.log("[ARTICLE_REVIEW]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/** Take a published article back down — plagiarism reports, rights complaints. */
export async function DELETE(
  _req: Request,
  { params }: Readonly<{ params: Promise<{ articleId: string }> }>
) {
  try {
    const { userId } = await auth()
    if (!userId || !isTeacher(userId)) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { articleId } = await params

    const article = await db.article.findUnique({
      where: { id: articleId },
      select: { status: true },
    })
    if (!article) return new NextResponse("Not Found", { status: 404 })
    if (article.status !== "PUBLISHED" && article.status !== "SCHEDULED") {
      return new NextResponse("Only a live or scheduled article can be taken down", {
        status: 409,
      })
    }

    const updated = await db.article.update({
      where: { id: articleId },
      data: { status: "ARCHIVED" },
    })

    return NextResponse.json({ id: updated.id, status: updated.status })
  } catch (error) {
    console.log("[ARTICLE_ARCHIVE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
