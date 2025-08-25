/*
  Warnings:

  - You are about to drop the column `user_id` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `data_inputed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `log_in_date` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `message_sent` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Teacher" DROP CONSTRAINT "Teacher_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."Teacher" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "data_inputed",
DROP COLUMN "log_in_date",
DROP COLUMN "message_sent",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_active" TIMESTAMP(3);
