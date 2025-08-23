/*
  Warnings:

  - You are about to drop the column `department_id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `total_course` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[course_code]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `course_code` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_name` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `units` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_department_id_fkey";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "department_id",
DROP COLUMN "name",
DROP COLUMN "total_course",
ADD COLUMN     "course_code" TEXT NOT NULL,
ADD COLUMN     "course_name" TEXT NOT NULL,
ADD COLUMN     "program_id" INTEGER,
ADD COLUMN     "units" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_code_key" ON "public"."Course"("course_code");

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "public"."Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
