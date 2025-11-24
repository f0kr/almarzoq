-- AlterTable
ALTER TABLE "public"."GroupUrl" ADD COLUMN     "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studentIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
