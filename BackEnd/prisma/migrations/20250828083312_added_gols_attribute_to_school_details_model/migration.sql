/*
  Warnings:

  - You are about to drop the column `accreditation` on the `SchoolDetail` table. All the data in the column will be lost.
  - You are about to drop the column `year_built` on the `SchoolDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SchoolDetail" DROP COLUMN "accreditation",
DROP COLUMN "year_built",
ADD COLUMN     "goals" TEXT;
