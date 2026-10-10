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

/** Any signed-in user may upload their own avatar. */
const handleUserAuth = async () => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }
    return { userId };
};

export const ourFileRouter = {
    userAvatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleUserAuth())
        .onUploadComplete(() => {}),
    // Journal writing is open to any signed-in visitor, so these two sit on
    // handleUserAuth — not handleAuth, which is admin-only.
    // `awaitServerData: false` because the client already has the url and key
    // from its own upload response — nothing here needs the server round-trip.
    // Without it the browser blocks on the callback, so one unreachable
    // callback (a firewall, a dev stream hiccup) silently wedges every upload.
    articleCover: f(
        { image: { maxFileSize: "8MB", maxFileCount: 1 } },
        { awaitServerData: false }
    )
        .middleware(() => handleUserAuth())
        .onUploadComplete(() => {}),
    articleImage: f(
        { image: { maxFileSize: "8MB", maxFileCount: 1 } },
        { awaitServerData: false }
    )
        .middleware(() => handleUserAuth())
        .onUploadComplete(() => {}),
    courseImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    categoryIcon: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    profileUrl: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {}),
    masterCover: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
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
