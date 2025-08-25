/*
  Warnings:

  - A unique constraint covering the columns `[device_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "device_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_device_id_key" ON "public"."User"("device_id");
