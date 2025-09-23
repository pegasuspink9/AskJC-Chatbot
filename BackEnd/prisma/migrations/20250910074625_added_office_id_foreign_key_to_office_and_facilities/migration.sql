/*
  Warnings:

  - You are about to drop the column `officeAndFacilities_id` on the `Office` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Office" DROP CONSTRAINT "Office_officeAndFacilities_id_fkey";

-- AlterTable
ALTER TABLE "public"."Office" DROP COLUMN "officeAndFacilities_id";

-- AlterTable
ALTER TABLE "public"."OfficeAndFacilities" ADD COLUMN     "office_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."OfficeAndFacilities" ADD CONSTRAINT "OfficeAndFacilities_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
