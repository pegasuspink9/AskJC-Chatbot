/*
  Warnings:

  - You are about to drop the column `program` on the `Program` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `StudentOrg` table. All the data in the column will be lost.
  - Added the required column `program_name` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_name` to the `StudentOrg` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Program" DROP COLUMN "program",
ADD COLUMN     "program_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."StudentOrg" DROP COLUMN "name",
ADD COLUMN     "organization_name" TEXT NOT NULL;
