/*
  Warnings:

  - The `chatbot_response` column on the `ChatbotSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."ChatbotSession" DROP COLUMN "chatbot_response",
ADD COLUMN     "chatbot_response" TEXT[];
