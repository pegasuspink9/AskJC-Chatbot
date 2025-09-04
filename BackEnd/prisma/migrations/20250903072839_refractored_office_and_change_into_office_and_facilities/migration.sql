/*
  Warnings:

  - You are about to drop the `OfficeImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."OfficeImage" DROP CONSTRAINT "OfficeImage_office_id_fkey";

-- DropTable
DROP TABLE "public"."OfficeImage";

-- CreateTable
CREATE TABLE "public"."OfficeAndFacilities" (
    "id" SERIAL NOT NULL,
    "office_id" INTEGER NOT NULL,
    "office_name" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "OfficeAndFacilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficeAndFacilities_office_id_key" ON "public"."OfficeAndFacilities"("office_id");

-- AddForeignKey
ALTER TABLE "public"."OfficeAndFacilities" ADD CONSTRAINT "OfficeAndFacilities_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
