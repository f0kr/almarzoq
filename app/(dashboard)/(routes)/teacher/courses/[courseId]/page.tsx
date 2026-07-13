import { IconBadge } from "@/components/IconBadge"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { CircleDollarSign, LayoutDashboard, ListCheck } from "lucide-react"
import { redirect } from "next/navigation"
import TitleForm from "./_components/TitleForm"
import DescriptionForm from "./_components/DescriptionForm.tsx"
import ImageForm from "./_components/ImageForm.tsx"
import CategoryForm from "./_components/CategoryForm"
import PriceForm from "./_components/PriceForm"
import { Banner } from "@/components/Banner"
import { Actions } from "./_components/Actions"
import LecturesForm from "./_components/LecturesForm"
import GroupUrlsForm from "./_components/GroupUrl"
import TeachersForm from "./_components/TeachersForm"

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
      lectures: {
        orderBy: {  
          position: 'asc'
        },
        include: {
          chapters: {
            orderBy : {
              position: 'asc'
            }
          }
        }
      },
      groupUrls: {
        orderBy: {
          createdAt: 'desc'
        }
      },
      teachers: true
    }
  })

  const masters = await db.teacher.findMany({
    orderBy: { name: "asc" }
  })

  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  if (!course) {
    redirect("/")
  }

  
  const chapters = await db.chapter.findMany({
      where: {
          courseId
      }
  })

  const isChaptersEmpty = chapters.length === 0
  
  const isFreeCourse = !isChaptersEmpty && chapters.every((chapter) => chapter.isFree)

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

  const isComplete = requiredFields.every(Boolean)

  return(
  <>
  {!course.isPublished && (
    <Banner
    label="This course is unpublished."
    />
  )}
    <div className="p-6">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                    Course setup
                </h1>
                <span className="text-sm text-foreground">Complete all fields {completionText}</span>
            </div>
            <Actions
            disabled={!isComplete}
            courseId={courseId}
            isPublished={course.isPublished}
            />
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
                <TeachersForm
                initialData={course}
                courseId={course.id}
                options={masters.map((master)=>({
                  label: master.name,
                  value: master.id,
                  title: master.title || "Title coming soon"
                }))}/>
                <GroupUrlsForm
                initialData={course.groupUrls}
                courseId={course.id}/>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-x-2">
                  <IconBadge icon={ListCheck}/>
                  <h2 className="text-xl">
                    Course chapters
                  </h2>
                </div>
                <LecturesForm
                initialData={course}
                chaptersInitialData={course}
                courseId={course.id}
                />
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
              courseId={course.id}
              isFreeCourse={isFreeCourse}
              isChaptersEmpty={isChaptersEmpty}
              />
            </div>
          </div>
        </div>
    </div>
</>
  )
}
