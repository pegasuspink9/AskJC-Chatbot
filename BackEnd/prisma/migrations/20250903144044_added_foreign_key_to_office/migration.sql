/*
  Warnings:

  - You are about to drop the `_FaqToOffice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_FaqToOffice" DROP CONSTRAINT "_FaqToOffice_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FaqToOffice" DROP CONSTRAINT "_FaqToOffice_B_fkey";

-- AlterTable
ALTER TABLE "public"."Office" ADD COLUMN     "officeAndFacilities_id" INTEGER;

-- DropTable
DROP TABLE "public"."_FaqToOffice";

-- AddForeignKey
ALTER TABLE "public"."Office" ADD CONSTRAINT "Office_officeAndFacilities_id_fkey" FOREIGN KEY ("officeAndFacilities_id") REFERENCES "public"."OfficeAndFacilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
