/*
  Warnings:

  - You are about to drop the column `name` on the `Department` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Department" DROP COLUMN "name",
ADD COLUMN     "department_name" TEXT;
