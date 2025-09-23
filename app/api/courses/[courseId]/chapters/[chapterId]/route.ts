import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node"
import { UTApi } from "uploadthing/server";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID,
    tokenSecret: process.env.MUX_TOKEN_SECRET
})
const video = mux.video

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
){
        const { courseId, chapterId } = await params
        const utapi = new UTApi()

        function extractKeyFromUploadThingUrl(url: string): string | null {
         if (!url) return null;
         const parts = url.split('/');
         return parts[parts.length - 1] || null;
    }
        
    try{
        const {userId} = await auth()
            
        if(!userId) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        
        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId
            }
        })

        
        if(!ownCourse) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const chapter = await db.chapter.findUnique({
            where: {
                id: chapterId,
                courseId: courseId
            }
        })

        if(!chapter) {
            return new NextResponse("Not Found", {status: 404})
        }

        if(chapter.videoUrl){

            const exixistingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId
                }
            })

            if(exixistingMuxData){
                await video.assets.delete(exixistingMuxData.assetId)
                await db.muxData.delete({
                    where: {
                        id : exixistingMuxData.id
                    }
                })
            }
             const key = extractKeyFromUploadThingUrl(chapter.videoUrl);
             if (key) await utapi.deleteFiles(key);
            }

        const deletedChapter = await db.chapter.delete({
            where: {
                id: chapterId
            }
        })

        const publishedChaptersInCourse = await db.chapter.findMany({
            where: {
                courseId,
                isPublished: true
            }
        })

        if(!publishedChaptersInCourse.length) {
            await db.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    isPublished: false
                }
            })
        }

        return NextResponse.json(deletedChapter)

    }catch (error){
        console.log("Chapter_Id_Delete", error)
        return new NextResponse("Internal Error", {status: 500})
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ courseId: string; chapterId: string }> }
){
    const { courseId, chapterId } = await params;

    try{
        const {userId} = await auth()
        const {isPublished, ...values} = await req.json()

        if(!userId) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const ownCourse = await db.course.findUnique({
            where: {
                id: courseId,
                userId: userId
            }
        })

        if(!ownCourse) {
            return new NextResponse("unauthorized", { status: 401 });
        }

        const chapter = await db.chapter.update({
            where: {
                id: chapterId,
                courseId: courseId
            },
            data: {
                ...values
            }

        })

        if(values.videoUrl){
            const existingMuxData = await db.muxData.findFirst({
                where: {
                    chapterId: chapterId
                }
            })      

            if(existingMuxData) {
                await video.assets.delete(existingMuxData.assetId)
                await db.muxData.delete({
                    where: {
                        id: existingMuxData.id
                    }
                })
        }

            const asset = await video.assets.create({
                inputs: [
                    {url: values.videoUrl},
                ],
                playback_policies: ["public"],
                test: false
            })

        await db.muxData.create({
            data: {
                chapterId: chapterId,
                assetId: asset.id,
                playbackId: asset.playback_ids?.[0]?.id,
            }
        })
    }

        return NextResponse.json(chapter, { status: 200 });

    }catch (error) {
        console.log("Error updating chapter:", error);
        return new NextResponse("internal server error", { status: 500 });
    }
}