import Image from "next/image"
import Link from "next/link"
import { db } from "@/lib/db"
import { ArrowLeft, BookOpen, ExternalLink, GraduationCap } from "lucide-react"
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
        include: {
          purchases: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!master) {
    return (
      <div className="p-6">
        <Link href="/masters" className="mb-6 flex items-center text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Masters
        </Link>
        <Card className="p-8">
          <p className="text-lg font-semibold text-slate-900">Master not found</p>
          <p className="mt-2 text-sm text-slate-600">The profile you are looking for does not exist.</p>
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

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-slate-50/80">
      <div className="relative mx-auto max-w-5xl px-4 py-10 space-y-8">
        <Link href="/masters" className="flex items-center text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Masters
        </Link>

        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <div className="relative h-32 bg-gradient-to-r from-sky-200 via-indigo-100 to-slate-50" />
          <CardContent className="relative -mt-16 pb-8 md:pb-10">
            <div className="flex flex-col gap-4 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100 backdrop-blur md:flex-row md:items-end md:justify-between md:p-5">
              <div className="flex gap-4 md:gap-6">
                <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white shadow-lg ring-2 ring-sky-100">
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
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      Teacher
                    </Badge>
                    <Badge variant="outline" className="border-sky-200 text-sky-800">
                      {totalCourses} {totalCourses === 1 ? "Course" : "Courses"}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                      {totalStudents} {totalStudents === 1 ? "Student" : "Students"}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-semibold leading-tight text-slate-900 break-words">{master.name}</h1>
                  <p className="text-sm text-slate-600">{master.title || "Title coming soon"}</p>
                </div>
              </div>
              {master.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {master.socialLinks.map((link) => {
                    const icon = iconForLink(link)
                    const label = icon !== "link" ? icon.charAt(0).toUpperCase() + icon.slice(1) : "Website"
                    return (
                      <span
                        key={link}
                        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                      >
                        <Icon name={icon} className={cn("h-4 w-4", icon === "link" && "text-slate-500")} />
                        {label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <GraduationCap className="h-4 w-4 text-sky-600" />
                  Bio
                </div>
                <div
                  className="prose prose-sm mt-3 max-w-none text-slate-700 prose-headings:text-slate-900 prose-a:text-sky-700"
                  dangerouslySetInnerHTML={{ __html: bioHtml }}
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <BookOpen className="h-4 w-4 text-sky-600" />
                  Courses
                </div>
                {master.courses.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">No courses published yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {master.courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-800 transition hover:border-sky-200 hover:bg-sky-50"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{course.title}</span>
                          <span className="text-xs text-slate-500">{course.purchases.length} students</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {master.socialLinks.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                This master hasn&apos;t added social links yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
