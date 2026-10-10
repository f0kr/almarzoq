import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { db } from "@/lib/db"
import { hasArabic } from "@/lib/lang"
import QRCode from "qrcode"
import { bindRtlLine, truncate, wrapTitle } from "@/lib/og"
import { shortCode } from "@/lib/journal/shortLink"

export const runtime = "nodejs"

/** Instagram / Facebook / TikTok stories are all 1080x1920. */
const WIDTH = 1080
const HEIGHT = 1920

const COVER_H = 1180
const FOOTER_H = 132
/** How far the cream fades up into the cover. */
const FADE_H = 320

// Atelier palette — globals.css can't be read from here, so the tokens are
// mirrored. Keep in sync with :root in app/globals.css.
const CREAM = "#faf5f0"
const INK = "#272727"
const GREY = "#4a4a4c"
const CLAY = "#9c6349"
const CLAY_TINT = "#f4ece6"

const FONT_DIR = join(process.cwd(), "assets", "fonts")

// Read once per lambda instance rather than per request.
let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 500 | 600 | 700; style: "normal" }[]
> | null = null

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(FONT_DIR, "PlayfairDisplay-Bold.ttf")),
    readFile(join(FONT_DIR, "Inter-Medium.ttf")),
    readFile(join(FONT_DIR, "Inter-SemiBold.ttf")),
    readFile(join(FONT_DIR, "IBMPlexSansArabic-SemiBold.ttf")),
  ]).then(([playfair, interMedium, interSemiBold, plexArabic]) => [
    { name: "Playfair", data: playfair, weight: 700 as const, style: "normal" as const },
    { name: "Inter", data: interMedium, weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: interSemiBold, weight: 600 as const, style: "normal" as const },
    // Must stay a distinct family name — see the chapter card route for why.
    { name: "PlexArabic", data: plexArabic, weight: 600 as const, style: "normal" as const },
  ])

  return fontsPromise
}

/** Inline remote images: a fetch failure inside satori takes the whole render down. */
async function fetchImage(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return null
    const type = res.headers.get("content-type") ?? "image/jpeg"
    const body = Buffer.from(await res.arrayBuffer())
    return `data:${type};base64,${body.toString("base64")}`
  } catch {
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const article = await db.article.findFirst({
    where: {
      slug: decodeURIComponent(slug),
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    },
    select: {
      id: true,
      title: true,
      coverUrl: true,
      updatedAt: true,
      readingMinutes: true,
      category: { select: { name: true, nameAr: true } },
      author: { select: { displayName: true, avatarUrl: true } },
    },
  })

  // Unpublished articles have no shareable card — the same rule the page uses.
  if (!article) return new Response("Not found", { status: 404 })

  // Absolute, and taken from the request rather than a constant: in production
  // that is the real domain, and in development it is whatever host the phone
  // used — so a card rendered on the LAN scans back to the LAN.
  const origin = new URL(request.url).origin
  const shortUrl = `${origin.replace(/^https?:\/\//, "")}/j/${shortCode(article.id)}`

  const [fonts, logo, cover, avatar, qr] = await Promise.all([
    loadFonts(),
    fetchImage(new URL("/logo-symbol.png", request.url).toString()),
    article.coverUrl ? fetchImage(article.coverUrl) : null,
    article.author.avatarUrl ? fetchImage(article.author.avatarUrl) : null,
    // Drawn in the Atelier palette rather than pure black on white. Error
    // correction level M tolerates the story being screenshotted and recompressed.
    QRCode.toDataURL(`${origin}/j/${shortCode(article.id)}`, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: INK, light: CREAM },
    }).catch(() => null),
  ])

  // Arabic needs hard spaces before satori orders it correctly, which costs it
  // the ability to wrap — so the lines are chosen here. See lib/og.ts.
  const rawTitle = truncate(article.title.trim(), 90)
  const titleSize = rawTitle.length > 42 ? 76 : 92
  const titleLines = wrapTitle(rawTitle, rawTitle.length > 42 ? 22 : 18, 3).map(bindRtlLine)

  const authorName = bindRtlLine(truncate(article.author.displayName.trim(), 32))
  const categoryLabel = article.category
    ? bindRtlLine(truncate(article.category.nameAr ?? article.category.name, 24))
    : null
  const initial = article.author.displayName.trim().charAt(0) || "؟"

  const image = new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: WIDTH,
          height: HEIGHT,
          background: CREAM,
        }}
      >
        {cover ? (
          <img
            src={cover}
            width={WIDTH}
            height={COVER_H}
            style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
          />
        ) : (
          // No cover: a clay wash rather than a blank slab. Two stops only —
          // satori flattens multi-stop rgba gradients.
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: WIDTH,
              height: COVER_H,
              display: "flex",
              backgroundImage: `linear-gradient(160deg, ${CLAY} 0%, ${CLAY_TINT} 100%)`,
            }}
          />
        )}

        {/* Fades the cover into the cream so the text never sits on an edge. */}
        <div
          style={{
            position: "absolute",
            top: COVER_H - FADE_H,
            left: 0,
            width: WIDTH,
            height: FADE_H,
            display: "flex",
            backgroundImage: `linear-gradient(180deg, rgba(250,245,240,0) 0%, ${CREAM} 100%)`,
          }}
        />

        {/* Wordmark, over the cover */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 72,
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 28px 14px 18px",
            borderRadius: 999,
            background: CREAM,
          }}
        >
          {logo ? <img src={logo} width={44} height={44} /> : null}
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: 3.6,
              color: CLAY,
            }}
          >
            ALMRZOQ JOURNAL
          </div>
        </div>

        {/* Lower half: everything that has to be readable at a glance */}
        <div
          style={{
            position: "absolute",
            bottom: FOOTER_H + 92,
            left: 0,
            width: WIDTH,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 34,
            padding: "0 80px",
          }}
        >
          {categoryLabel ? (
            <div
              style={{
                display: "flex",
                padding: "12px 30px",
                borderRadius: 999,
                background: CLAY,
                fontFamily: hasArabic(categoryLabel) ? "PlexArabic" : "Inter",
                fontWeight: 600,
                fontSize: 28,
                color: CREAM,
              }}
            >
              {categoryLabel}
            </div>
          ) : null}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              fontFamily: hasArabic(rawTitle) ? "PlexArabic" : "Playfair",
              fontWeight: 700,
              fontSize: titleSize,
              lineHeight: 1.35,
              color: INK,
            }}
          >
            {titleLines.map((line, i) => (
              <div key={i} style={{ display: "flex" }}>
                {line}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: hasArabic(authorName) ? "PlexArabic" : "Inter",
                  fontWeight: 600,
                  fontSize: 38,
                  color: INK,
                }}
              >
                {authorName}
              </div>
              {article.readingMinutes ? (
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Inter",
                    fontWeight: 500,
                    fontSize: 26,
                    color: GREY,
                  }}
                >
                  {`${article.readingMinutes} min read`}
                </div>
              ) : null}
            </div>

            {/* Avatar last in DOM order so it lands on the right, matching the
                right-aligned Arabic block above it. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 104,
                height: 104,
                borderRadius: 999,
                overflow: "hidden",
                background: CLAY_TINT,
              }}
            >
              {avatar ? (
                <img src={avatar} width={104} height={104} style={{ objectFit: "cover" }} />
              ) : (
                <div
                  style={{
                    display: "flex",
                    fontFamily: hasArabic(initial) ? "PlexArabic" : "Inter",
                    fontWeight: 600,
                    fontSize: 46,
                    color: CLAY,
                  }}
                >
                  {initial}
                </div>
              )}
            </div>
          </div>

          {qr ? (
            <div
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                // Right-aligned like the byline above it, so the card keeps one
                // clean edge instead of zig-zagging.
                justifyContent: "flex-end",
                gap: 20,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "PlexArabic",
                  fontWeight: 600,
                  fontSize: 30,
                  color: GREY,
                }}
              >
                {bindRtlLine("امسح الرمز لقراءة المقال")}
              </div>
              <img
                src={qr}
                width={136}
                height={136}
                style={{ borderRadius: 18, border: `3px solid ${CLAY_TINT}` }}
              />
            </div>
          ) : null}
        </div>

        {/* Footer call to action */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: WIDTH,
            height: FOOTER_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: CLAY,
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 1.4,
            color: CREAM,
          }}
        >
          {shortUrl}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts }
  )

  // `v` pins the URL to updatedAt, so a hit carrying one can be cached hard —
  // any edit mints a different URL.
  const versioned =
    new URL(request.url).searchParams.get("v") === article.updatedAt.getTime().toString(36)

  return new Response(image.body, {
    headers: {
      "content-type": "image/png",
      "cache-control": versioned
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
