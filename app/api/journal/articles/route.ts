import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseArticleInput } from "@/lib/journal/articleInput"
import { uniqueSlug } from "@/lib/journal/slug"
import { TERMS_VERSION } from "@/lib/journal/terms"

/** Create an article — saved as a draft, or sent straight to the review queue. */
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse("Unauthorized", { status: 401 })

    const body = (await req.json()) as Record<string, unknown>
    const submitting = body.action === "submit"

    const parsed = parseArticleInput(body)
    if ("error" in parsed) return new NextResponse(parsed.error, { status: 400 })
    const { data } = parsed

    // The declaration is only required to *submit*; a draft is still private.
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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { name: true, imageUrl: true },
    })

    const author = await db.editorProfile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: data.author.displayName || user?.name || "كاتب",
        // Falls back to the account's picture when the writer didn't supply one.
        avatarUrl: data.author.avatarUrl ?? user?.imageUrl ?? null,
        bio: data.author.bio,
        instagram: data.author.instagram,
        facebook: data.author.facebook,
        website: data.author.website,
      },
      update: {
        displayName: data.author.displayName,
        avatarUrl: data.author.avatarUrl ?? user?.imageUrl ?? null,
        bio: data.author.bio,
        instagram: data.author.instagram,
        facebook: data.author.facebook,
        website: data.author.website,
      },
    })

    const slug = await uniqueSlug(data.title, async (candidate) =>
      Boolean(
        await db.article.findUnique({ where: { slug: candidate }, select: { id: true } })
      )
    )

    const article = await db.article.create({
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        coverUrl: data.coverUrl,
        coverKey: data.coverKey,
        contentHtml: data.contentHtml,
        contentText: data.contentText,
        readingMinutes: data.readingMinutes,
        status: submitting ? "PENDING" : "DRAFT",
        submittedAt: submitting ? new Date() : null,
        termsVersion: submitting ? TERMS_VERSION : null,
        termsAcceptedAt: submitting ? new Date() : null,
        authorId: author.id,
        categoryId: data.categoryId,
        proposedCategory: data.proposedCategory,
        resources: {
          create: data.resources.map((resource, index) => ({
            label: resource.label,
            url: resource.url,
            position: index,
          })),
        },
      },
    })

    return NextResponse.json({ id: article.id, slug: article.slug }, { status: 201 })
  } catch (error) {
    console.log("[ARTICLE_CREATE]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
