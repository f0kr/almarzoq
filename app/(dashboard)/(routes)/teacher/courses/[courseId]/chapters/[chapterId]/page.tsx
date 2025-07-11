import { IconBadge } from "@/components/IconBadge";
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation"
import ChapterTitleForm from "./_components/ChapterTitleForm";
import ChapterDescriptionForm from "./_components/ChapterDescriptionForm";
import ChapterAccessForm from "./_components/ChapterAccessForm";
import ChapterVideoForm from "./_components/ChapterVideoForm";

export default async function ChapterIdPage({
    params,
 }:  { 
    params: Promise<{ chapterId: string; courseId: string }> 
}){
    const {userId} = await auth()

    if(!userId) {
        return redirect("/")
    }

    const chapter = await db.chapter.findUnique({
        where: {
            id: (await params).chapterId,
            courseId: (await params).courseId
    },
include: {
    muxData: true
},
})

if(!chapter) {
    return redirect("/")
}

const requiredFields = [
    chapter.title,
    chapter.description,
    chapter.videoUrl
]

const totlaFields = requiredFields.length
const completedFields = requiredFields.filter(Boolean).length

const completioText = `9(${completedFields}/${totlaFields})`

return (
    <div className="p-6">
      <div className="flex items-center justify-between ">
        <div className="w-full">
            <Link
            href={`/teacher/courses/${(await params).courseId}`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-2xl font-medium">
                        Chapter Creation
                    </h1>
                    <span className="text-sm text-slate-700">
                        Complete all fields {completioText}
                    </span>
                </div>
            </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-16">
        <div className="space-y-4">
            <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={LayoutDashboard}/>
                    <h2 className="text-xl">
                        Customize your chapter
                    </h2>
                </div>
                  <ChapterTitleForm
                  initialData={chapter}
                  courseId={(await params).courseId}
                  chapterId={(await params).chapterId}
                  />
                  <ChapterDescriptionForm
                  initialData={chapter}
                  courseId={(await params).courseId}
                  chapterId={(await params).chapterId}
                  />
            </div>
         <div>
             <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye}/>
                <h2 className="text-xl">
                    Access Settings
                </h2>
             </div>
               <ChapterAccessForm
               initialData={chapter}
               courseId={(await params).courseId}
               chapterId={(await params).chapterId}
               />
          </div>
        </div>
        <div>
        <div className="flex items-center gap-x-2">
            <IconBadge
            icon={Video}
            />
            <h2 className="text-xl">Add a video</h2>
        </div>
        <ChapterVideoForm
        initialData={chapter}
        courseId={(await params).courseId}
        chapterId={(await params).chapterId}
        />
        </div>
      </div>
    </div>
)
}
