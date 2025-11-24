-- AlterTable
ALTER TABLE "public"."GroupUrl" ADD COLUMN     "userIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
