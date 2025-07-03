import { IconBadge } from "@/components/IconBadge"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { CircleDollarSign, File, LayoutDashboard, ListCheck } from "lucide-react"
import { redirect } from "next/navigation"
import TitleForm from "./_components/TitleForm"
import DescriptionForm from "./_components/DescriptionForm.tsx"
import ImageForm from "./_components/ImageForm.tsx"
import CategoryForm from "./_components/CategoryForm"
import PriceForm from "./_components/PriceForm"
import AttachmentsForm from "./_components/AttachmentsForm"
import ChaptersForm from "./_components/ChaptersForm"

export default async function CoursePage({
    params
}: Readonly<{
  params: Promise<{ courseId: string }>

}>) {
  
  const {userId} = await auth()
  const { courseId } = await params

  if (!userId) {
    redirect("/")
  }

  const course = await db.course.findUnique({
    where: {
        id: courseId,
        userId
    },
    include: {
      chapters: {
        orderBy: {
          position: 'asc'
        }
      },
      attachments: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  if (!course) {
    redirect("/")
  }

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
    course.chapters.some((chapter)=> chapter.isPublished)
  ]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields}) `

  return(
    <div className="p-6">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                    Course setup
                </h1>
                <span className="text-sm text-slate-700">Complete all fields {completionText}</span>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={LayoutDashboard}/>
                    <h2 className="text-xl">
                        Customize your course
                    </h2>
                </div>
                <TitleForm
                initialData={course}
                courseId={course.id}/>
                <DescriptionForm
                initialData={course}
                courseId={course.id}/>
                <ImageForm
                initialData={course}
                courseId={course.id}/>
                <CategoryForm
                initialData={course}
                courseId={course.id}
                options={categories.map((category)=>({
                  label: category.name,
                  value: category.id
                }))}/>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListCheck}/>
                  <h2 className="text-xl">
                    Course chapters
                  </h2>
                </div>
                <ChaptersForm
                initialData={course}
                courseId={course.id}/>
              </div>
              <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign}/>
                <h2 className="text-xl">
                  Sell Your Course
                </h2>
              </div>
              <PriceForm
              initialData={course}
              courseId={course.id}/>
            </div>
          </div>
          <div>
                 <div className="flex items-center gap-x-2">
                <IconBadge icon={File}/>
                <h2 className="text-xl">
                  Resources and Attachments
                </h2>
              </div>
                <AttachmentsForm
                initialData={course}
                courseId={course.id}/>
          </div>
        </div>
    </div>
  )
}