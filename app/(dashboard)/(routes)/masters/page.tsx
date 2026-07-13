import Image from "next/image"
import Link from "next/link"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"

const formatBioSnippet = (bio?: string) => {
  if (!bio) return "This master is getting their story ready."

  const text = bio.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
  if (!text) return "This master is getting their story ready."

  return text.length > 140 ? `${text.slice(0, 140).trim()}...` : text
}

export default async function MastersPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string }>
}>) {
  const sp = await searchParams
  const query = sp?.q?.toString().trim() ?? ""
  const hasQuery = Boolean(query)

  const masters = await db.teacher.findMany({
    where: {
      isPublished: true,
      ...(hasQuery
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { title: { contains: query, mode: "insensitive" } },
              { bio: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      courses: {
        select: {
          id: true,
          purchases: {
            select: { id: true },
          },
          isPublished: true,
        },
      },
    },
  })

  return (
    <div className="relative min-h-[calc(100vh-80px)]">
      <div className="relative mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
            Masters
          </p>
          <h1 className="text-3xl font-semibold text-foreground">
            Meet the teachers shaping your craft
          </h1>
          <p className="max-w-3xl text-sm md:text-base text-muted-foreground">
            Explore the mentors behind our courses. Each master brings their own perspective, so find the voices you
            resonate with.
          </p>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row sm:items-center" method="GET">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search masters by name, title, or bio"
              className="h-11 w-full rounded-full border-border bg-card pl-10 pr-12 text-sm"
            />
            {hasQuery && (
              <Button
                asChild
                variant="ghost"
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
              >
                <Link href="/masters">Clear</Link>
              </Button>
            )}
          </div>
          <Button type="submit" className="h-11 sm:w-28">
            Search
          </Button>
        </form>

        {masters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-foreground">
              {hasQuery ? "No masters match your search" : "No masters published yet"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasQuery ? "Try a different name, title, or keyword." : "New mentors are on the way. Check back soon to meet them."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {masters.map((master) => {
              const courseCount = master.courses.length
              const studentCount = master.courses.reduce((total, course) => total + course.purchases.length, 0)

              return (
                <Link key={master.id} href={`/masters/${master.id}`} className="group block">
                  <Card className="relative w-full overflow-hidden rounded-2xl border-border bg-card px-6 py-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg">
                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-tan to-clay" aria-hidden />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-primary text-xl transition-transform group-hover:translate-x-1" aria-hidden>&rarr;</span>
                    <div className="absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ring-primary/20 group-hover:ring-primary/30">
                      <Image
                        src={master.profileUrl || "/icons/default-avatar.png"}
                        alt={master.name || "Master profile"}
                        fill
                        sizes="64px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <CardContent className="pl-24 pr-2 sm:pr-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="rounded-full bg-clay px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-clay-tint">
                          Teacher
                        </span>
                        <span className="text-xs font-medium text-muted-foreground line-clamp-1">
                          {master.title || "Title coming soon"}
                        </span>
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                        {master.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1 rounded-full bg-paper border border-beige px-2.5 py-1">
                          <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
                          {courseCount} {courseCount === 1 ? "course" : "courses"}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-paper border border-beige px-2.5 py-1">
                          <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
                          {studentCount} {studentCount === 1 ? "student" : "students"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs md:text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {formatBioSnippet(master.bio!)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
