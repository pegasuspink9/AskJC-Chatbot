/*
  Warnings:

  - Added the required column `dropdown_menu` to the `Navigation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Navigation" ADD COLUMN     "dropdown_menu" TEXT NOT NULL;
