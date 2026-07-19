import { isTeacher } from "@/lib/teacher";
import { auth } from "@/lib/auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const handleAuth = async () => {
    const { userId } = await auth();
    const isAuthenticated = isTeacher(userId)
    if (!userId || !isAuthenticated) {
        throw new Error("Unauthorized");
    }
    return { userId };
};

export const ourFileRouter = {
    courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    categoryIcon: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    profileUrl: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    courseAttachment: f({
        text: { maxFileSize: "16MB" },
        image: { maxFileSize: "16MB" },
        video: { maxFileSize: "512MB" },
        audio: { maxFileSize: "128MB" },
        pdf: { maxFileSize: "32MB" },
    })
        .middleware(() => handleAuth())
        .onUploadComplete(async ({ file, metadata }) => {
         return { url: file.ufsUrl, name: file.name };
}),
    chapterVideo: f({video: { maxFileSize: "512GB" }})
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
