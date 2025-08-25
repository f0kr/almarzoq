import { db } from "@/lib/db";
import Categories from "./_components/Categories";
import { getCourses } from "@/actions/getCourses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/CoursesList";
import { SearchInput } from "@/components/SearchInput";
import { Suspense } from "react";

interface SearchPageProps {
  searchParams: Promise<{
    title: string
    categoryId: string
  }>
}

export default async function SearchPage({
  searchParams
}: SearchPageProps) {

  const {userId} = await auth()
  const sp = await searchParams
  if(!userId) return redirect("/")

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    })

    const courses = await getCourses({
      userId,
      ...searchParams
    })
    return (
      <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchInput />
        </Suspense>
      </div>
       <div className="p-6 space-y-4">
        <Categories
        items={categories}
        />
        <CoursesList items={courses}/>
       </div>
      </>
    );
}