/*
  Warnings:

  - You are about to drop the column `name` on the `SchoolOfficial` table. All the data in the column will be lost.
  - Added the required column `official_name` to the `SchoolOfficial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SchoolOfficial" DROP COLUMN "name",
ADD COLUMN     "official_name" TEXT NOT NULL;
