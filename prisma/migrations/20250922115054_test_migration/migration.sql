/*
  Warnings:

  - You are about to drop the column `courseId` on the `Attachment` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_courseId_fkey";

-- DropIndex
DROP INDEX "public"."Attachment_courseId_idx";

-- AlterTable
ALTER TABLE "public"."Attachment" DROP COLUMN "courseId",
ADD COLUMN     "chapterId" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_chapterId_idx" ON "public"."Attachment"("chapterId");

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
