-- DropForeignKey
ALTER TABLE "public"."OfficeAndFacilities" DROP CONSTRAINT "OfficeAndFacilities_office_id_fkey";

-- AlterTable
ALTER TABLE "public"."OfficeAndFacilities" ALTER COLUMN "office_id" DROP NOT NULL,
ALTER COLUMN "office_name" DROP NOT NULL,
ALTER COLUMN "room_number" DROP NOT NULL,
ALTER COLUMN "image_url" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."OfficeAndFacilities" ADD CONSTRAINT "OfficeAndFacilities_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
