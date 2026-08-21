import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { db } from "@/lib/db"
import { hasArabic } from "@/lib/lang"
import { bindArabicRuns, muxThumbnailUrl, truncate, wrapTitle } from "@/lib/og"

export const runtime = "nodejs"

const WIDTH = 1200
const HEIGHT = 630

// The frame occupies the right of the card. Asking Mux for exactly this shape
// lets its smartcrop pick the salient region — cropping a full-width frame in
// CSS instead just shows whatever happened to fall on the right edge.
const PANEL_X = 560
const PANEL_W = WIDTH - PANEL_X
const FADE_W = 210

// Atelier palette — globals.css can't be read from here, so the tokens the
// card uses are mirrored. Keep in sync with :root in app/globals.css.
const CREAM = "#faf5f0"
const INK = "#272727"
const GREY = "#4a4a4c"
const CLAY = "#9c6349"

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
    // satori falls back to this per-glyph for Arabic. It must be a distinct
    // family name — reusing "Playfair" would drop it as a duplicate weight and
    // satori then throws trying to shape Arabic with a Latin-only font.
    { name: "PlexArabic", data: plexArabic, weight: 600 as const, style: "normal" as const },
  ])

  return fontsPromise
}

/**
 * satori can fetch remote images itself, but a failure there takes down the
 * whole render. Fetching here means a dead thumbnail degrades to the next
 * fallback instead of a 500.
 */
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

const PlayBadge = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 76,
      height: 76,
      borderRadius: 76,
      background: CLAY,
      boxShadow: "0 10px 30px rgba(39, 39, 39, 0.28)",
    }}
  >
    <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
      <path d="M25 15 0 30V0z" fill={CREAM} />
    </svg>
  </div>
)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> },
) {
  const { chapterId } = await params

  const chapter = await db.chapter.findFirst({
    where: { id: chapterId, isPublished: true },
    select: {
      title: true,
      position: true,
      updatedAt: true,
      muxData: { select: { playbackId: true } },
      course: { select: { title: true, imageUrl: true } },
    },
  })

  if (!chapter) {
    return new Response("Not found", { status: 404 })
  }

  const [fonts, logo] = await Promise.all([
    loadFonts(),
    fetchImage(new URL("/logo-symbol.png", request.url).toString()),
  ])

  // Frame first, course art second — a chapter with no video still gets a card.
  const frame =
    (chapter.muxData?.playbackId &&
      (await fetchImage(muxThumbnailUrl(chapter.muxData.playbackId, PANEL_W, HEIGHT)))) ||
    (chapter.course.imageUrl && (await fetchImage(chapter.course.imageUrl))) ||
    null

  // Arabic needs hard spaces before satori will order it correctly, which
  // costs it the ability to wrap — so the lines are chosen here. See lib/og.ts.
  const rawTitle = truncate(chapter.title.trim(), 64)
  const titleSize = rawTitle.length > 24 ? 48 : 58
  const titleLines = wrapTitle(rawTitle, rawTitle.length > 24 ? 24 : 20).map(bindArabicRuns)
  const courseTitle = bindArabicRuns(truncate(chapter.course.title.trim(), 44))

  const image = new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: WIDTH,
          height: HEIGHT,
          background: CREAM,
        }}
      >
        {frame ? (
          <img
            src={frame}
            width={PANEL_W}
            height={HEIGHT}
            style={{ position: "absolute", top: 0, left: PANEL_X, objectFit: "cover" }}
          />
        ) : null}

        {/* Softens the seam into the cream column. Two stops only — satori
            renders multi-stop rgba gradients as a flat fill, which washed the
            frame out entirely. */}
        {frame ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: PANEL_X,
              width: FADE_W,
              height: HEIGHT,
              display: "flex",
              backgroundImage: `linear-gradient(90deg, ${CREAM} 0%, rgba(250,245,240,0) 100%)`,
            }}
          />
        ) : null}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            // With no frame to sit beside, the text takes the full card rather
            // than leaving a conspicuously empty panel.
            width: frame ? 700 : WIDTH,
            height: HEIGHT,
            padding: "58px 56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {logo ? <img src={logo} width={40} height={40} /> : null}
            <div
              style={{
                display: "flex",
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: 19,
                letterSpacing: 3.4,
                color: CLAY,
              }}
            >
              ALMRZOQ ACADEMY
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                fontFamily: hasArabic(courseTitle) ? "PlexArabic" : "Inter",
                fontWeight: 500,
                fontSize: 25,
                color: GREY,
              }}
            >
              {courseTitle}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontFamily: hasArabic(rawTitle) ? "PlexArabic" : "Playfair",
                fontWeight: 700,
                fontSize: titleSize,
                lineHeight: 1.2,
                color: INK,
              }}
            >
              {titleLines.map((line, i) => (
                <div key={i} style={{ display: "flex" }}>
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <PlayBadge />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontFamily: "Inter",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontWeight: 600,
                  fontSize: 17,
                  letterSpacing: 2.4,
                  color: CLAY,
                }}
              >
                {`LESSON ${chapter.position + 1}`}
              </div>
              <div style={{ display: "flex", fontWeight: 500, fontSize: 19, color: GREY }}>
                Watch on almrzoq.academy
              </div>
            </div>
          </div>
        </div>

        {/* Keeps the cream half from bleeding into a light chat background. */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: WIDTH,
            height: 6,
            display: "flex",
            background: CLAY,
          }}
        />
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts },
  )

  // `v` pins the URL to the chapter's updatedAt, so a hit that carries one can
  // be cached hard — any edit mints a different URL.
  const versioned =
    new URL(request.url).searchParams.get("v") ===
    chapter.updatedAt.getTime().toString(36)

  return new Response(image.body, {
    headers: {
      "content-type": "image/png",
      "cache-control": versioned
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  })
}
