import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, BookOpen, GraduationCap, Lock, Play, Layers, Clock } from "lucide-react"
import { getCourseLanding } from "@/actions/getCourseLanding"
import { getCourseDuration } from "@/actions/getCourseDuration"
import { auth } from "@/lib/auth"
import { formatPrice } from "@/lib/format"
import { detectLang, langAttrs } from "@/lib/lang"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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

  const { course, purchase, firstChapter, chapterCount, lectureCount, freeChapterCount } = data
  const duration = await getCourseDuration(course.id)
  const isFreeCourse = !course.price || course.price === 0
  const hasAccess = Boolean(purchase) || isFreeCourse

  const descriptionHtml =
    (course.description && course.description.trim()) ||
    "<p>Full course details are on their way.</p>"

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

      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
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

          {/* CTA card */}
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
              </div>
            )}
            <CardContent className="space-y-4 p-5">
              <p className="font-serif text-2xl font-semibold text-foreground">
                {isFreeCourse ? "Free" : formatPrice(course.price!)}
              </p>

              {hasAccess && firstChapter ? (
                <Button asChild size="lg" className="w-full">
                  <Link href={`/courses/${course.id}/chapters/${firstChapter.id}`}>
                    {purchase ? "Continue learning" : "Start free course"}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="w-full">
                  <a href={ENROLL_CONTACT} target="_blank" rel="noopener noreferrer">
                    Enroll for {formatPrice(course.price!)}
                  </a>
                </Button>
              )}

              {!hasAccess && firstChapter && freeChapterCount > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  Or start with a free preview lesson below.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Description — server-rendered HTML so search engines can read it. */}
        <section className="mt-10">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            About this course
          </h2>
          <div
            lang={detectLang(descriptionHtml)}
            className="prose prose-sm max-w-none rounded-xl border border-border bg-paper p-5 text-foreground prose-headings:text-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
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
                    const content = (
                      <div className="flex items-center gap-3 px-4 py-3">
                        {canView ? (
                          <Play className="h-4 w-4 shrink-0 text-primary" />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <span {...langAttrs(chapter.title)} className="flex-1 text-sm text-foreground">
                          {chapter.title}
                        </span>
                        {chapter.isFree && !hasAccess && (
                          <Badge variant="sage" className="text-[10px]">Free</Badge>
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
    </div>
  )
}
