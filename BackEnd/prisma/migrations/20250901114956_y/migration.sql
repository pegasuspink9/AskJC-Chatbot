/*
  Warnings:

  - You are about to drop the column `name` on the `Scholarship` table. All the data in the column will be lost.
  - Added the required column `scholarship_name` to the `Scholarship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Scholarship" DROP COLUMN "name",
ADD COLUMN     "scholarship_name" TEXT NOT NULL;
