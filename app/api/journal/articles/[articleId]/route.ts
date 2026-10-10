import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseArticleInput } from "@/lib/journal/articleInput"
import { uniqueSlug } from "@/lib/journal/slug"
import { TERMS_VERSION } from "@/lib/journal/terms"

/** Edit your own article, and optionally resubmit it after a rejection. */
export async function PATCH(
  req: Request,
  { params }: Readonly<{ params: Promise<{ articleId: string }> }>
) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const { articleId } = await params

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: { author: { select: { userId: true } } },
    })

    if (!article) return new NextResponse("Not Found", { status: 404 })
    if (article.author.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Only a draft or a returned article is the author's to change. While it
    // sits in the queue it must not move under the reviewer, and once it is
    // live an edit would bypass review entirely.
    if (article.status !== "DRAFT" && article.status !== "CHANGES_REQUESTED") {
      return new NextResponse(
        article.status === "PENDING"
          ? "This article is under review and can't be edited"
          : "A published article can't be edited — contact the academy",
        { status: 409 }
      )
    }

    const body = (await req.json()) as Record<string, unknown>
    const submitting = body.action === "submit"

    const parsed = parseArticleInput(body)
    if ("error" in parsed) return new NextResponse(parsed.error, { status: 400 })
    const { data } = parsed

    if (submitting && body.acceptedTerms !== true) {
      return new NextResponse("You must accept the publishing declaration before submitting", { status: 400 })
    }

    if (data.categoryId) {
      const category = await db.journalCategory.findFirst({
        where: { id: data.categoryId, isActive: true },
        select: { id: true },
      })
      if (!category) return new NextResponse("That category is not available", { status: 400 })
    }

    await db.editorProfile.update({
      where: { userId },
      data: {
        displayName: data.author.displayName,
        avatarUrl: data.author.avatarUrl,
        bio: data.author.bio,
        instagram: data.author.instagram,
        facebook: data.author.facebook,
        website: data.author.website,
      },
    })

    // Re-slug on a retitle only while the article has never been live, so no
    // published URL can break.
    const slug =
      data.title !== article.title && !article.publishedAt
        ? await uniqueSlug(data.title, async (candidate) => {
            const row = await db.article.findUnique({
              where: { slug: candidate },
              select: { id: true },
            })
            return Boolean(row) && row?.id !== articleId
          })
        : article.slug

    const updated = await db.$transaction(async (tx) => {
      // Resources are small and ordered; replacing them is simpler and more
      // predictable than diffing.
      await tx.articleResource.deleteMany({ where: { articleId } })

      return tx.article.update({
        where: { id: articleId },
        data: {
          slug,
          title: data.title,
          excerpt: data.excerpt,
          coverUrl: data.coverUrl,
          coverKey: data.coverKey,
          contentHtml: data.contentHtml,
          contentText: data.contentText,
          readingMinutes: data.readingMinutes,
          categoryId: data.categoryId,
          proposedCategory: data.proposedCategory,
          ...(submitting
            ? {
                status: "PENDING" as const,
                submittedAt: new Date(),
                termsVersion: TERMS_VERSION,
                termsAcceptedAt: new Date(),
              }
            : {}),
          resources: {
            create: data.resources.map((resource, index) => ({
              label: resource.label,
              url: resource.url,
              position: index,
            })),
          },
        },
      })
    })

    return NextResponse.json({ id: updated.id, slug: updated.slug })
  } catch (error) {
    console.log("[ARTICLE_PATCH]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

/** Authors may delete their own article as long as it was never published. */
export async function DELETE(
  _req: Request,
  { params }: Readonly<{ params: Promise<{ articleId: string }> }>
) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const { articleId } = await params

    const article = await db.article.findUnique({
      where: { id: articleId },
      include: { author: { select: { userId: true } } },
    })

    if (!article) return new NextResponse("Not Found", { status: 404 })
    if (article.author.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    if (article.publishedAt) {
      return new NextResponse("A published article can't be deleted — contact the academy", { status: 409 })
    }

    await db.article.delete({ where: { id: articleId } })

    return NextResponse.json({ id: articleId })
  } catch (error) {
    console.log("[ARTICLE_DELETE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
