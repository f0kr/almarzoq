import { IconBadge } from "@/components/IconBadge"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { ArrowLeft, LayoutDashboard } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import NameForm from "./_components/NameForm"
import TitleForm from "./_components/TitleForm"
import BioForm from "./_components/BioForm"
import ProfileUrlForm from "./_components/ProfileUrlForm"
import CoverImageForm from "./_components/CoverImageForm"
import SocialLinksForm from "./_components/SocialLinksForm"
import { Banner } from "@/components/Banner"
import { Actions } from "./_components/Actions"

export default async function MasterPage({
    params
}: Readonly<{
    params: Promise<{ masterId: string }>
}>) {

    const { userId } = await auth()
    const { masterId } = await params

    if (!userId) {
        redirect("/")
    }

    const master = await db.teacher.findUnique({
        where: {
            id: masterId
        },
        include: {
            courses: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    if (!master) {
        redirect("/teacher/masters")
    }

    const requiredFields = [
        master.name,
        master.title,
        master.bio,
    ]

    const totalFields = requiredFields.length
    const completedFields = requiredFields.filter(Boolean).length

    const completionText = `(${completedFields}/${totalFields})`

    const isComplete = requiredFields.every(Boolean)

    return (
        <>
            {!master.isPublished && (
              <Banner
              label="This master is unpublished."
              />
            )}
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-y-2">
                    <h1 className="text-2xl font-medium">
                        Master setup
                    </h1>
                    <span className="text-sm text-foreground">Complete all fields {completionText}</span>
                </div>
                <Actions
                disabled={!isComplete}
                masterId={masterId}
                isPublished={master.isPublished}
                />
            </div>
            <div className="p-6">
                <Link href="/teacher/masters" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Masters
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
                    <div>
                        <div className="flex items-center gap-x-2">
                            <IconBadge icon={LayoutDashboard} />
                            <h2 className="text-xl">
                                Master Information
                            </h2>
                        </div>

                        <NameForm
                            initialData={master}
                            masterId={master.id}
                        />

                        <TitleForm
                            initialData={master}
                            masterId={master.id}
                        />

                        <BioForm
                            initialData={master}
                            masterId={master.id}
                        />

                        <ProfileUrlForm
                            initialData={master}
                            masterId={master.id}
                        />

                        <CoverImageForm
                            initialData={master}
                            masterId={master.id}
                        />

                        <SocialLinksForm
                            initialData={master}
                            masterId={master.id}
                        />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-x-2">
                                <IconBadge icon={LayoutDashboard} />
                                <h2 className="text-xl">
                                    Associated Courses
                                </h2>
                            </div>
                            <div className="mt-4">
                                {master.courses.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {master.courses.map((course) => (
                                            <Link
                                            key={course.id}
                                            href={`/teacher/courses/${course.id}`}
                                            >
                                                <div className="p-4 border border-border rounded-md hover:bg-muted">
                                                    <h3 className="font-medium">{course.title}</h3>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
