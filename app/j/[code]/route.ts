import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SHORT_CODE_LENGTH } from "@/lib/journal/shortLink"

/**
 * Resolves the short link printed on a story card to the article itself.
 *
 * A uuid's first 8 characters are the code, so the lookup is a prefix match.
 * An ambiguous prefix sends the reader to the journal index rather than
 * guessing which article they meant.
 */
export async function GET(
  req: Request,
  { params }: Readonly<{ params: Promise<{ code: string }> }>
) {
  const { code } = await params
  // Redirect relative to where the request arrived, not to a configured base.
  // The QR on a story card encodes the origin that rendered it, so a card made
  // on the LAN has to resolve back to the LAN — sending the phone to a
  // configured localhost would simply fail.
  const base = req.url

  const clean = code.toLowerCase().replace(/[^0-9a-f]/g, "")
  if (clean.length !== SHORT_CODE_LENGTH) {
    return NextResponse.redirect(new URL("/journal", base))
  }

  const matches = await db.article.findMany({
    where: { id: { startsWith: clean }, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    select: { slug: true },
    take: 2,
  })

  if (matches.length !== 1) {
    return NextResponse.redirect(new URL("/journal", base))
  }

  return NextResponse.redirect(
    new URL(`/journal/${encodeURIComponent(matches[0].slug)}`, base)
  )
}
