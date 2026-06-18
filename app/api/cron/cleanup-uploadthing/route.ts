import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";

const utapi = new UTApi();

const getKeyFromUrl = (url: string | null) => {
    
  if (!url) return null;

  try {
    const { pathname } = new URL(url);
    return pathname.split("/f/")[1] ?? null;
  } catch(error) {
    return console.log(error);
  }
};

export async function GET() {

    const files = (await utapi.listFiles()).files;

  // DB records
  const attachments = await db.attachment.findMany({
    select: { key: true }
  });

  const videos = await db.chapter.findMany({
    select: { videoUrl: true }
  });

  const images = await db.course.findMany({
    select: { imageUrl: true }
  });

  const icons = await db.category.findMany({
    select: { iconUrl: true }
  });

  const profileImages = await db.teacher.findMany({
    select: { profileUrl: true }
  });

  // Build unified key set
  const dbKeys = new Set<string>();

  // Direct keys
  attachments.forEach(a => {
    if (a.key) dbKeys.add(a.key);
  });

  // URL-based keys
  [
    ...videos.map(v => v.videoUrl),
    ...images.map(i => i.imageUrl),
    ...icons.map(i => i.iconUrl),
    ...profileImages.map(p => p.profileUrl),
  ]
    .map(getKeyFromUrl)
    .filter((key): key is string => Boolean(key))
    .forEach(key => dbKeys.add(key));

  // 4️⃣ Find garbage
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const garbage = files
    .filter(f => !dbKeys.has(f.key))
    .filter(f => new Date(f.uploadedAt).getTime() < Date.now() - SEVEN_DAYS)
    .map(f => f.key);

  // Delete
  if (garbage.length) {
    await utapi.deleteFiles(garbage);
  }

  return Response.json({
    totalFiles: files.length,
    referencedFiles: dbKeys.size,
    garbageCount: garbage.length,
  });
}
