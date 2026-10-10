import { createHash } from "crypto"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"

/**
 * One view per visitor per article per day.
 *
 * The visitor is identified by a salted hash of IP + user-agent, never stored
 * raw: the salt mixes in the date and the app secret, so the column can't be
 * walked back to an IP address and the identifier rotates every midnight.
 * That also *is* the dedupe window — the same reader tomorrow counts again,
 * which is the usual meaning of a view count.
 */
function visitorKey(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? ""
  const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  const agent = req.headers.get("user-agent") ?? "unknown"
  const day = new Date().toISOString().slice(0, 10)

  return createHash("sha256")
    .update(`${ip}|${agent}|${day}|${process.env.JWT_SECRET ?? ""}`)
    .digest("hex")
}

export async function POST(req: Request) {
  try {
    const { articleId } = (await req.json()) as { articleId?: string }
    if (!articleId) return new NextResponse("Bad Request", { status: 400 })

    // Only a live article can accrue views — otherwise a draft's id could be
    // used to inflate a counter before anyone can read it.
    const article = await db.article.findFirst({
      where: { id: articleId, status: "PUBLISHED" },
      select: { id: true },
    })
    if (!article) return NextResponse.json({ counted: false })

    try {
      await db.$transaction([
        db.articleView.create({ data: { articleId, visitorKey: visitorKey(req) } }),
        db.article.update({
          where: { id: articleId },
          data: { viewCount: { increment: 1 } },
        }),
      ])
      return NextResponse.json({ counted: true })
    } catch (error) {
      // P2002 = this visitor already counted today. Expected, not an error.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json({ counted: false })
      }
      throw error
    }
  } catch (error) {
    console.log("[ARTICLE_VIEW]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
