/*
  Warnings:

  - You are about to drop the column `office_id` on the `OfficeAndFacilities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OfficeAndFacilities" DROP CONSTRAINT "OfficeAndFacilities_office_id_fkey";

-- DropIndex
DROP INDEX "public"."OfficeAndFacilities_office_id_key";

-- AlterTable
ALTER TABLE "public"."OfficeAndFacilities" DROP COLUMN "office_id";
