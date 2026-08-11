import Mux from "@mux/mux-node";
import { db } from "@/lib/db";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

/** Seconds → "1h 50m" / "45m". Null for zero/unknown. */
export function formatDuration(totalSeconds: number): string | null {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  return `${mins}m`;
}

/**
 * Total course runtime, summed from each published chapter's Mux asset.
 *
 * Mux only knows an asset's duration once it has finished processing, and there
 * is no Mux webhook here, so we lazily fetch any missing duration from the Mux
 * API and cache it on MuxData. After the first view every chapter's duration is
 * stored, so later calls are pure DB reads. Fully best-effort: any failure just
 * omits that chapter (and ultimately yields null) rather than throwing.
 */
export async function getCourseDuration(courseId: string): Promise<string | null> {
  try {
    const chapters = await db.chapter.findMany({
      where: { courseId, isPublished: true },
      select: {
        muxData: { select: { id: true, assetId: true, duration: true } },
      },
    });

    let total = 0;
    for (const chapter of chapters) {
      const muxData = chapter.muxData;
      if (!muxData) continue;

      let seconds = muxData.duration ?? null;
      if (seconds == null && muxData.assetId) {
        try {
          const asset = await mux.video.assets.retrieve(muxData.assetId);
          if (asset?.duration) {
            seconds = asset.duration;
            await db.muxData.update({
              where: { id: muxData.id },
              data: { duration: seconds },
            });
          }
        } catch {
          // Asset still processing or Mux unreachable — skip it.
        }
      }

      if (seconds) total += seconds;
    }

    return formatDuration(total);
  } catch (error) {
    console.log("[GET_COURSE_DURATION]", error);
    return null;
  }
}
