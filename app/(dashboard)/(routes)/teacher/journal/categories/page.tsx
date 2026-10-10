import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { isTeacher } from "@/lib/teacher"
import { DataTable } from "../../categories/_components/DataTable"
import { columns, type JournalCategoryRow } from "./_components/Columns"
import JournalCategoryForm from "./_components/JournalCategoryForm"

const JournalCategoriesPage = async () => {
  const { userId } = await auth()

  if (!userId || !isTeacher(userId)) return redirect("/")

  const categories = await db.journalCategory.findMany({
    orderBy: [{ position: "asc" }, { name: "asc" }],
    include: { _count: { select: { articles: true } } },
  })

  const rows: JournalCategoryRow[] = categories.map(({ _count, ...category }) => ({
    ...category,
    articleCount: _count.articles,
  }))

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-serif font-semibold text-2xl md:text-[28px]">
          Journal categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          The list writers choose from when they submit an article.
        </p>
      </div>

      <JournalCategoryForm />

      <DataTable columns={columns} data={rows} />
    </div>
  )
}

export default JournalCategoriesPage
