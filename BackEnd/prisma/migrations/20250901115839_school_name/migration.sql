/*
  Warnings:

  - You are about to drop the column `name` on the `SchoolDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SchoolDetail" DROP COLUMN "name",
ADD COLUMN     "school_name" TEXT;
