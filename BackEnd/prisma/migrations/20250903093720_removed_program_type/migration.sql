/*
  Warnings:

  - Changed the type of `program_type` on the `Program` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Program" DROP COLUMN "program_type",
ADD COLUMN     "program_type" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."ProgramType";
