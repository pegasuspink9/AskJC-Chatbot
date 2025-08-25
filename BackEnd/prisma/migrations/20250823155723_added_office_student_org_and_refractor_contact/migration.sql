/*
  Warnings:

  - You are about to drop the column `info` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `school_detail_id` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `name` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Contact" DROP CONSTRAINT "Contact_school_detail_id_fkey";

-- AlterTable
ALTER TABLE "public"."Contact" DROP COLUMN "info",
DROP COLUMN "number",
DROP COLUMN "school_detail_id",
DROP COLUMN "website",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "fb_page" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."Office" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location_building" TEXT,
    "location_floor" TEXT,
    "operating_hours" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "fb_page" TEXT,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentOrg" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fb_page" TEXT,

    CONSTRAINT "StudentOrg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FaqToOffice" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FaqToOffice_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_FaqToStudentOrg" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FaqToStudentOrg_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ContactToFaq" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContactToFaq_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Office_name_key" ON "public"."Office"("name");

-- CreateIndex
CREATE INDEX "_FaqToOffice_B_index" ON "public"."_FaqToOffice"("B");

-- CreateIndex
CREATE INDEX "_FaqToStudentOrg_B_index" ON "public"."_FaqToStudentOrg"("B");

-- CreateIndex
CREATE INDEX "_ContactToFaq_B_index" ON "public"."_ContactToFaq"("B");

-- AddForeignKey
ALTER TABLE "public"."_FaqToOffice" ADD CONSTRAINT "_FaqToOffice_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FaqToOffice" ADD CONSTRAINT "_FaqToOffice_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FaqToStudentOrg" ADD CONSTRAINT "_FaqToStudentOrg_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FaqToStudentOrg" ADD CONSTRAINT "_FaqToStudentOrg_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."StudentOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ContactToFaq" ADD CONSTRAINT "_ContactToFaq_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ContactToFaq" ADD CONSTRAINT "_ContactToFaq_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
