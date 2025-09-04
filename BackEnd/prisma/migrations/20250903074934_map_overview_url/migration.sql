/*
  Warnings:

  - You are about to drop the column `map_overview_uril` on the `OfficeAndFacilities` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."OfficeAndFacilities" DROP COLUMN "map_overview_uril",
ADD COLUMN     "map_overview_url" TEXT;
