/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `ChatbotSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChatbotSession_user_id_key" ON "public"."ChatbotSession"("user_id");
