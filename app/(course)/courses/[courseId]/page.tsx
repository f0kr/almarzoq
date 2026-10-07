import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lock,
  Play,
  Layers,
  Clock,
} from "lucide-react"
import { getCourseLanding } from "@/actions/getCourseLanding"
import { getCourseDuration } from "@/actions/getCourseDuration"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/format"
import { detectLang, langAttrs } from "@/lib/lang"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const BASE_URL = "https://www.almrzoq.academy"
const ENROLL_CONTACT = "https://ig.me/m/almrzoq.academy"

const plainText = (html?: string | null) =>
  (html ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>
}): Promise<Metadata> {
  const { courseId } = await params
  const data = await getCourseLanding({ courseId })

  if (!data) {
    return { title: "Course not found", robots: { index: false, follow: false } }
  }

  const { course } = data
  const summary = plainText(course.description)
  const description = summary
    ? summary.length > 155
      ? `${summary.slice(0, 155).trim()}...`
      : summary
    : `Learn ${course.title} at Almrzoq Academy — a structured art course taught by working professional artists.`

  return {
    title: course.title,
    description,
    alternates: { canonical: `/courses/${courseId}` },
    openGraph: {
      title: course.title,
      description,
      url: `/courses/${courseId}`,
      type: "website",
      images: course.imageUrl ? [{ url: course.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
      images: course.imageUrl ? [course.imageUrl] : undefined,
    },
  }
}

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const { userId } = await auth()

  const data = await getCourseLanding({ courseId, userId })
  if (!data) notFound()

  const {
    course,
    purchase,
    firstChapter,
    resumeChapter,
    resumeNumber,
    completedCount,
    completedChapterIds,
    chapterCount,
    lectureCount,
    freeChapterCount,
  } = data
  const duration = await getCourseDuration(course.id)
  const isFreeCourse = !course.price || course.price === 0
  const hasAccess = Boolean(purchase) || isFreeCourse

  // ---- The one thing this page has to get across: where to click to watch. ---
  // `playChapter` is that single destination. For a student with access it's the
  // lesson they left off at; for a visitor it's the free preview, if there is
  // one. It drives the cover image, the button and the highlighted syllabus row
  // alike, so all three agree on where "continue" goes.
  const playChapter = hasAccess
    ? resumeChapter
    : firstChapter?.isFree
      ? firstChapter
      : null
  const progressPct =
    chapterCount > 0 ? Math.round((completedCount / chapterCount) * 100) : 0
  const isFinished = hasAccess && chapterCount > 0 && completedCount >= chapterCount
  const completedIds = new Set(completedChapterIds)

  const ctaLabel = !hasAccess
    ? `Enroll for ${formatPrice(course.price!)}`
    : isFinished
      ? "Rewatch the course"
      : completedCount > 0
        ? "Continue learning"
        : isFreeCourse && !purchase
          ? "Start free course"
          : "Start learning"

  // Naming the lesson behind the button is what removes the guesswork.
  const ctaHint =
    hasAccess && playChapter
      ? `${isFinished ? "Lesson" : completedCount > 0 ? "Up next · Lesson" : "Starts with lesson"} ${resumeNumber} of ${chapterCount}: ${playChapter.title}`
      : null

  // Descriptions are typed into a plain textarea, so their newlines are the
  // only paragraph markers. They're rendered as text (not injected as HTML)
  // with `whitespace-pre-line`, which keeps those breaks and — together with
  // `bidi-plaintext` — lets each line take its own direction, so an Arabic
  // line and an English one can sit in the same description.
  const description =
    course.description?.trim() || "Full course details are on their way."

  // Course structured data for rich results. Free preview chapters are the
  // only publicly viewable syllabus items, so they carry a URL.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: plainText(course.description) || undefined,
      inLanguage: detectLang(course.title),
      url: `${BASE_URL}/courses/${course.id}`,
      image: course.imageUrl || undefined,
      provider: {
        "@type": "EducationalOrganization",
        name: "Almrzoq Academy",
        url: BASE_URL,
      },
      ...(course.teachers.length > 0 && {
        instructor: course.teachers.map((t) => ({
          "@type": "Person",
          name: t.name,
          jobTitle: t.title || "Art Instructor",
          url: `${BASE_URL}/masters/${t.id}`,
        })),
      }),
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
      },
      offers: {
        "@type": "Offer",
        category: isFreeCourse ? "Free" : "Paid",
        price: isFreeCourse ? "0" : String(course.price),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${BASE_URL}/courses/${course.id}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: course.title,
          item: `${BASE_URL}/courses/${course.id}`,
        },
      ],
    },
  ]

  return (
    <div className="min-h-dvh bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Self-contained top bar — this route sits outside the dashboard chrome. */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-symbol.png" alt="Almrzoq Academy" width={32} height={32} className="h-8 w-8" />
            <span className="font-serif text-sm font-semibold text-foreground">Al<span className="text-[#9c6349]">mrzoq</span> Academy</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Browse courses
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 pt-8 pb-28 md:py-10">
        {/* Hero */}
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-start">
          <div className="space-y-4">
            {course.category && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                {course.category.name}
              </p>
            )}
            <h1
              {...langAttrs(course.title)}
              className="font-serif text-3xl font-semibold leading-tight text-foreground md:text-4xl"
            >
              {course.title}
            </h1>

            {course.teachers.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Taught by</span>
                {course.teachers.map((t, i) => (
                  <span key={t.id} {...langAttrs(t.name)} className="font-medium text-foreground">
                    <Link href={`/masters/${t.id}`} className="hover:text-primary hover:underline">
                      {t.name}
                    </Link>
                    {i < course.teachers.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="clay">
                <Layers className="mr-1 h-3.5 w-3.5" />
                {lectureCount} {lectureCount === 1 ? "section" : "sections"}
              </Badge>
              <Badge variant="category">
                <BookOpen className="mr-1 h-3.5 w-3.5" />
                {chapterCount} {chapterCount === 1 ? "lesson" : "lessons"}
              </Badge>
              {duration && (
                <Badge variant="clay">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  {duration}
                </Badge>
              )}
              {freeChapterCount > 0 && (
                <Badge variant="sage">
                  <Play className="mr-1 h-3.5 w-3.5" />
                  {freeChapterCount} free {freeChapterCount === 1 ? "preview" : "previews"}
                </Badge>
              )}
            </div>
          </div>

          {/* CTA card — sticky on desktop so the action never scrolls away. */}
          <div className="md:sticky md:top-20">
            <Card className="overflow-hidden rounded-2xl border-border bg-card shadow-sm">
              {course.imageUrl && (
                <div className="relative aspect-video w-full bg-secondary">
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width:768px) 100vw, 400px"
                    className="object-cover"
                    unoptimized
                    priority
                  />
                  {/* Students instinctively click the cover, so make that work. */}
                  {playChapter && (
                    <Link
                      href={`/courses/${course.id}/chapters/${playChapter.id}`}
                      aria-label={`${hasAccess ? ctaLabel : "Watch the free preview lesson"}: ${playChapter.title}`}
                      className="group absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-ink/30 transition-colors hover:bg-ink/45 focus-visible:ring-4 focus-visible:ring-clay/70 focus-visible:outline-none"
                    >
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cream/95 shadow-lg transition-transform group-hover:scale-105">
                        <Play className="h-6 w-6 translate-x-[2px] fill-clay text-clay" />
                      </span>
                      <span className="rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-cream">
                        {hasAccess ? ctaLabel : "Watch free preview"}
                      </span>
                    </Link>
                  )}
                </div>
              )}
              <CardContent className="space-y-4 p-5">
                {/* Price is only news before you own the course. Afterwards the
                    headline belongs to how far along you are. */}
                {purchase ? (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-sage">
                      <CheckCircle2 className="h-4 w-4" />
                      You&apos;re enrolled
                    </p>
                    {chapterCount > 0 && (
                      <>
                        <Progress className="h-2" value={progressPct} variant={isFinished ? "success" : "default"} />
                        <p className="text-xs font-medium text-muted-foreground">
                          {completedCount} of {chapterCount} lessons complete · {progressPct}%
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="font-serif text-2xl font-semibold text-foreground">
                    {isFreeCourse ? "Free" : formatPrice(course.price!)}
                  </p>
                )}

                {hasAccess && playChapter ? (
                  <div className="space-y-2">
                    <Button asChild size="lg" variant="soft" className="h-12 w-full text-base">
                      <Link href={`/courses/${course.id}/chapters/${playChapter.id}`}>
                        <Play className="h-4 w-4 fill-current" />
                        {ctaLabel}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {ctaHint && (
                      <p
                        {...langAttrs(playChapter.title)}
                        className="bidi-plaintext text-center text-xs text-muted-foreground"
                      >
                        {ctaHint}
                      </p>
                    )}
                  </div>
                ) : (
                  <Button asChild size="lg" variant="soft" className="h-12 w-full text-base">
                    <a href={ENROLL_CONTACT} target="_blank" rel="noopener noreferrer">
                      Enroll for {formatPrice(course.price!)}
                    </a>
                  </Button>
                )}

                {!hasAccess && playChapter && (
                  <p className="text-center text-xs text-muted-foreground">
                    Or watch a free preview lesson first — no payment needed.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description — server-rendered so search engines can read it. */}
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            About this course
          </h2>
          <div
            lang={detectLang(description)}
            className="bidi-plaintext prose prose-sm max-w-none whitespace-pre-line rounded-xl border border-border bg-paper p-5 text-foreground prose-headings:text-foreground prose-a:text-primary"
          >
            {description}
          </div>
        </section>

        {/* Curriculum */}
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            Course content
          </h2>
          <div className="space-y-4">
            {course.lectures.map((lecture) => (
              <div key={lecture.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div {...langAttrs(lecture.title)} className="border-b border-border bg-paper px-4 py-3 font-medium text-foreground">
                  {lecture.title}
                </div>
                <ul className="divide-y divide-border">
                  {lecture.chapters.map((chapter) => {
                    const canView = chapter.isFree || hasAccess
                    const isDone = completedIds.has(chapter.id)
                    // The same lesson the big button opens, flagged here too —
                    // the syllabus is the other place students go looking.
                    const isNext = playChapter?.id === chapter.id
                    const content = (
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3",
                          isNext && "bg-clay-tint",
                        )}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" />
                        ) : canView ? (
                          <Play
                            className={cn("h-4 w-4 shrink-0 text-primary", isNext && "fill-current")}
                          />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          {...langAttrs(chapter.title)}
                          className={cn(
                            "flex-1 text-sm text-foreground",
                            isNext && "font-semibold",
                            isDone && !isNext && "text-muted-foreground",
                          )}
                        >
                          {chapter.title}
                        </span>
                        {isNext && (
                          <Badge variant="clay" className="shrink-0 text-[10px]">
                            {hasAccess
                              ? completedCount > 0
                                ? "Continue here"
                                : "Start here"
                              : "Free preview"}
                          </Badge>
                        )}
                        {chapter.isFree && !hasAccess && !isNext && (
                          <Badge variant="sage" className="text-[10px]">Free</Badge>
                        )}
                        {canView && (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                    )
                    return (
                      <li key={chapter.id}>
                        {canView ? (
                          <Link
                            href={`/courses/${course.id}/chapters/${chapter.id}`}
                            className="block transition-colors hover:bg-paper"
                          >
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Instructors */}
        {course.teachers.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
              <GraduationCap className="h-5 w-5 text-primary" />
              {course.teachers.length === 1 ? "Your instructor" : "Your instructors"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {course.teachers.map((t) => (
                <Link
                  key={t.id}
                  href={`/masters/${t.id}`}
                  className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                    <Image
                      src={t.profileUrl || "/icons/default-avatar.png"}
                      alt={t.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p {...langAttrs(t.name)} className="font-semibold text-foreground group-hover:text-primary">
                      {t.name}
                    </p>
                    {t.title && (
                      <p {...langAttrs(t.title)} className="text-sm text-muted-foreground">{t.title}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile has no sticky sidebar, so the action rides along at the bottom. */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        {hasAccess && playChapter ? (
          <Button asChild size="lg" variant="soft" className="h-12 w-full text-base">
            <Link href={`/courses/${course.id}/chapters/${playChapter.id}`}>
              <Play className="h-4 w-4 fill-current" />
              {ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="shrink-0 font-serif text-lg font-semibold text-foreground">
              {isFreeCourse ? "Free" : formatPrice(course.price!)}
            </p>
            <Button asChild size="lg" variant="soft" className="h-12 flex-1 text-base">
              <a href={ENROLL_CONTACT} target="_blank" rel="noopener noreferrer">
                Enroll now
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
