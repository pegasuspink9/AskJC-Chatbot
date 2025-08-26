/*
  Warnings:

  - Made the column `question` on table `Faq` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category` on table `Faq` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Faq" ALTER COLUMN "question" SET NOT NULL,
ALTER COLUMN "category" SET NOT NULL;
