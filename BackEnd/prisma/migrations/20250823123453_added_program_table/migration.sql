/*
  Warnings:

  - You are about to drop the column `created_at` on the `Department` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ProgramType" AS ENUM ('undergraduate', 'graduate', 'seniorhighschool', 'other');

-- AlterTable
ALTER TABLE "public"."Department" DROP COLUMN "created_at";

-- CreateTable
CREATE TABLE "public"."Program" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "program_type" "public"."ProgramType" NOT NULL,
    "program" TEXT NOT NULL,
    "tuition_fee" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Program" ADD CONSTRAINT "Program_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
