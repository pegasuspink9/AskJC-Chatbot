/*
  Warnings:

  - You are about to drop the column `name` on the `Office` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[office_name]` on the table `Office` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `office_name` to the `Office` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Office_name_key";

-- AlterTable
ALTER TABLE "public"."Office" DROP COLUMN "name",
ADD COLUMN     "office_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Office_office_name_key" ON "public"."Office"("office_name");
