/*
  Warnings:

  - Added the required column `key` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Attachment" ADD COLUMN     "key" TEXT NOT NULL;
