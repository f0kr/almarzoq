import { db } from "@/lib/db";
import Categories from "./_components/Categories";
import { getCourses } from "@/actions/getCourses";
import { auth } from "@clerk/nextjs/server";
import { CoursesList } from "@/components/CoursesList";
import { SearchInput } from "@/components/SearchInput";
import { Hero } from "@/components/Hero";
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

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    })

    const courses = await getCourses({
      userId,
      ...sp
    })
    return (
      <>
      {!userId ? (
        <Hero />
      ) : (
        <div className="px-6 pt-8 pb-2">
          <h1 className="font-serif font-semibold text-2xl md:text-3xl mb-1">
            Master the <em className="italic text-primary">Art</em> of Drawing
          </h1>
          <p className="text-sm text-grey">
            Pick up where you left off, or explore something new.
          </p>
        </div>
      )}
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <Suspense fallback={<div>Loading...</div>}>
          <SearchInput />
        </Suspense>
      </div>
       <div id="courses" className="p-6 space-y-4">
        <Categories
        items={categories}
        />
        <CoursesList items={courses}/>
       </div>
      </>
    );
}