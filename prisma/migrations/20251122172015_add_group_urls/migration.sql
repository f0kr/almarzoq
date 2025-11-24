/*
  Warnings:

  - You are about to drop the column `groupUrl` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "groupUrl";

-- CreateTable
CREATE TABLE "public"."GroupUrl" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupUrl_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupUrl_courseId_idx" ON "public"."GroupUrl"("courseId");

-- AddForeignKey
ALTER TABLE "public"."GroupUrl" ADD CONSTRAINT "GroupUrl_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
