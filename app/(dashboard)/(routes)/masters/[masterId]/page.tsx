import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db"
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react"
import { formatPrice } from "@/lib/format"
import { FaTwitter, FaLinkedin, FaYoutube, FaInstagram, FaFacebook, FaLink } from "react-icons/fa"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const iconForLink = (url: string) => {
  const lower = url.toLowerCase()
  if (lower.includes("twitter") || lower.includes("x.com")) return "twitter"
  if (lower.includes("linkedin")) return "linkedin"
  if (lower.includes("youtube")) return "youtube"
  if (lower.includes("instagram")) return "instagram"
  if (lower.includes("facebook")) return "facebook"
  return "link"
}

const Icon = ({ name, className }: { name: string; className?: string }) => {
  switch (name) {
    case "twitter":
      return <FaTwitter className={className} />
    case "linkedin":
      return <FaLinkedin className={className} />
    case "youtube":
      return <FaYoutube className={className} />
    case "instagram":
      return <FaInstagram className={className} />
    case "facebook":
      return <FaFacebook className={className} />
    default:
      return <FaLink className={className} />
  }
}

const plainText = (html?: string | null) =>
  (html ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<{ masterId: string }>
}>): Promise<Metadata> {
  const { masterId } = await params

  const master = await db.teacher.findUnique({
    where: { id: masterId },
    select: { name: true, title: true, bio: true, profileUrl: true, isPublished: true },
  })

  if (!master) {
    return { title: "Master not found", robots: { index: false, follow: false } }
  }

  const bio = plainText(master.bio)
  const description = bio
    ? bio.length > 155
      ? `${bio.slice(0, 155).trim()}...`
      : bio
    : `${master.name}${master.title ? `, ${master.title}` : ""} teaches at Almrzoq Academy. Explore their courses in drawing, painting and digital art.`

  const title = master.title ? `${master.name} — ${master.title}` : master.name

  return {
    title,
    description,
    alternates: { canonical: `/masters/${masterId}` },
    // Unpublished profiles are still reachable by direct URL; keep them out of the index.
    robots: master.isPublished ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: `/masters/${masterId}`,
      type: "profile",
      images: master.profileUrl ? [{ url: master.profileUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: master.profileUrl ? [master.profileUrl] : undefined,
    },
  }
}

export default async function MasterProfilePage({
  params,
}: Readonly<{
  params: Promise<{ masterId: string }>
}>) {
  const { masterId } = await params

const master = await db.teacher.findUnique({
  where: { id: masterId },
  include: {
    courses: {
      where: { isPublished: true },
      include: { purchases: true },
      orderBy: { createdAt: "desc" },
    },
  },
})


  if (!master) {
    return (
      <div className="p-6">
        <Link href="/masters" className="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Masters
        </Link>
        <Card className="p-8">
          <p className="text-lg font-semibold text-foreground">Master not found</p>
          <p className="mt-2 text-sm text-muted-foreground">The profile you are looking for does not exist.</p>
        </Card>
      </div>
    )
  }

  const studentIds = new Set<string>()
  master.courses.forEach((course) => {
    course.purchases.forEach((p) => studentIds.add(p.userId))
  })

  const totalStudents = studentIds.size
  const totalCourses = master.courses.length

  const bioHtml =
    (master.bio && master.bio.trim()) ||
    "<p>This master hasn't added a bio yet.</p>"

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: master.name,
      jobTitle: master.title || "Art Instructor",
      description: plainText(master.bio) || undefined,
      image: master.profileUrl || undefined,
      url: `https://www.almrzoq.academy/masters/${master.id}`,
      // socialLinks are stored as "label|url" pairs.
      sameAs: master.socialLinks
        .map((link) => link.split("|")[1])
        .filter(Boolean),
      worksFor: {
        "@type": "EducationalOrganization",
        name: "Almrzoq Academy",
        url: "https://www.almrzoq.academy",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.almrzoq.academy",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Masters",
          item: "https://www.almrzoq.academy/masters",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: master.name,
        },
      ],
    },
  ]

  return (
    <div className="relative min-h-[calc(100dvh-80px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative mx-auto max-w-5xl px-4 py-10 space-y-8">
        <Link href="/masters" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Masters
        </Link>

        <Card className="overflow-hidden rounded-[20px] border-border bg-card shadow-sm">
          <div className="relative h-32 bg-gradient-to-r from-tan via-sage-pale to-paper" />
          <CardContent className="relative -mt-16 pb-8 md:pb-10">
            <div className="flex flex-col gap-4 rounded-2xl bg-card/90 p-4 shadow-sm ring-1 ring-border backdrop-blur md:flex-row md:items-end md:justify-between md:p-5">
              <div className="flex gap-4 md:gap-6">
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white shadow-lg ring-2 ring-primary/20">
                  <Image
                    src={master.profileUrl || "/icons/default-avatar.png"}
                    alt={master.name || "Master profile"}
                    fill
                    className="object-cover"
                    sizes="112px"
                    unoptimized
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="category">
                      Teacher
                    </Badge>
                    <Badge variant="clay">
                      {totalCourses} {totalCourses === 1 ? "Course" : "Courses"}
                    </Badge>
                    <Badge variant="sage">
                      {totalStudents} {totalStudents === 1 ? "Student" : "Students"}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-semibold leading-tight text-foreground break-words">{master.name}</h1>
                  <p className="text-sm text-muted-foreground">{master.title || "Title coming soon"}</p>
                </div>
              </div>
              {master.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {master.socialLinks.map((link) => {
                    const icon = iconForLink(link)
                    const label = icon !== "link" ? icon.charAt(0).toUpperCase() + icon.slice(1) : "Website"
                    return (
                      <a
                      key={link}
                      href={link.split("|")[1]}
                      target="_blank"
                      >
                      <span
                        className="flex items-center gap-2 rounded-full border border-beige bg-paper px-3 py-1.5 text-xs font-semibold text-grey"
                      >
                        <Icon name={icon} className={cn("h-4 w-4", icon === "link" && "text-muted-foreground")} />
                        {label}
                      </span>
                      </a>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 rounded-xl border border-border bg-paper p-5">
              <div className="flex items-center gap-2 font-serif text-base font-semibold text-foreground">
                <GraduationCap className="h-4 w-4 text-primary" />
                About
              </div>
              <div
                className="prose prose-sm mt-3 max-w-none text-foreground prose-headings:text-foreground prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: bioHtml }}
              />
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-foreground">
                <BookOpen className="h-5 w-5 text-primary" />
                Courses by {master.name || "this master"}
              </div>
              {master.courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses published yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {master.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="group rounded-2xl border border-border bg-card p-2.5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(39,39,39,0.10)]"
                    >
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-secondary">
                        {course.imageUrl && (
                          <Image
                            src={course.imageUrl}
                            alt={course.title || "Course"}
                            fill
                            sizes="(max-width:768px) 50vw, 260px"
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="px-1 pt-2.5 pb-1">
                        <h3 className="font-serif text-sm font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
                          {course.title}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {course.price ? formatPrice(course.price) : "Free"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {master.socialLinks.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-border bg-muted p-4 text-sm text-muted-foreground">
                This master hasn&apos;t added social links yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
