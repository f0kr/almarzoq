/*
  Warnings:

  - You are about to drop the column `profileImage` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "isFree" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "profileImage",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
