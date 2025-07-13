import { db } from "@/lib/db";
import Categories from "./_components/Categories";
import { SearchInput } from "@/components/SearchInput";
import { getCourses } from "@/actions/getCourses";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CoursesList } from "@/components/CoursesList";

/* interface SearchPageProps {
  searchParams: Promise<{
    title: string
    categoryId: string
  }>
} */

export default async function SearchPage({
  searchParams
}: {searchParams: Promise<{title: string; categoryId: string}>}) {

  const {userId} = await auth()
  if(!userId) return redirect("/")

    const categories = await db.category.findMany({
        orderBy: {
            name: "asc"
        }
    })

    const courses = await getCourses({
      userId,
      ... await searchParams
    })
    return (
      <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput/>
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