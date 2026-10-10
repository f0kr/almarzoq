import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ArticleForm } from "@/components/journal/ArticleForm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const metadata: Metadata = {
  title: "Write an article",
  robots: { index: false, follow: false },
}

export default async function SubmitArticlePage() {
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent("/journal/submit")}`)

  const [categories, teachers, profile, user] = await Promise.all([
    db.journalCategory.findMany({
      where: { isActive: true },
      orderBy: [{ position: "asc" }, { name: "asc" }],
      select: { id: true, name: true, nameAr: true },
    }),
    db.teacher.findMany({
      where: { isPublished: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.editorProfile.findUnique({ where: { userId } }),
    db.user.findUnique({ where: { id: userId }, select: { name: true, imageUrl: true } }),
  ])

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <h1 className="font-serif text-3xl font-semibold text-foreground">Write an article</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Write in Arabic. An editor reviews every submission before it is published — you&apos;ll
        see the decision, and any requested changes, under{" "}
        <span className="font-semibold">My articles</span>.
      </p>

      <div className="mt-8">
        <ArticleForm
          categories={categories}
          teachers={teachers}
          initial={{
            title: "",
            coverUrl: null,
            coverKey: null,
            categoryId: null,
            proposedCategory: null,
            contentHtml: "",
            resources: [],
            // Pre-filled from the editor profile, falling back to the account.
            displayName: profile?.displayName ?? user?.name ?? "",
            avatarUrl: profile?.avatarUrl ?? user?.imageUrl ?? null,
            bio: profile?.bio ?? null,
            instagram: profile?.instagram ?? null,
            facebook: profile?.facebook ?? null,
            website: profile?.website ?? null,
            teacherId: profile?.teacherId ?? null,
          }}
        />
      </div>
    </main>
  )
}
