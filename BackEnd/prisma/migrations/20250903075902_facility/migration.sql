/*
  Warnings:

  - You are about to drop the column `image_url` on the `OfficeAndFacilities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."OfficeAndFacilities" DROP COLUMN "image_url",
ADD COLUMN     "facility_name" TEXT,
ADD COLUMN     "facility_url" TEXT,
ADD COLUMN     "office_url" TEXT;
