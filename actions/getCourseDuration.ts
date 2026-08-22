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

    // Fetched in parallel: a course whose durations are not cached yet would
    // otherwise serialise one Mux round-trip per chapter while a visitor waits
    // on the landing page render.
    const durations = await Promise.all(
      chapters.map(async ({ muxData }) => {
        if (!muxData) return 0;
        if (muxData.duration != null) return muxData.duration;
        if (!muxData.assetId) return 0;

        try {
          const asset = await mux.video.assets.retrieve(muxData.assetId);
          if (!asset?.duration) return 0;
          await db.muxData.update({
            where: { id: muxData.id },
            data: { duration: asset.duration },
          });
          return asset.duration;
        } catch {
          // Asset still processing or Mux unreachable — skip it.
          return 0;
        }
      }),
    );

    const total = durations.reduce((sum, seconds) => sum + seconds, 0);

    return formatDuration(total);
  } catch (error) {
    console.log("[GET_COURSE_DURATION]", error);
    return null;
  }
}
