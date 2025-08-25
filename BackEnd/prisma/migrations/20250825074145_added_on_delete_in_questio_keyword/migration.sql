-- DropForeignKey
ALTER TABLE "public"."QuestionKeyword" DROP CONSTRAINT "QuestionKeyword_faq_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."QuestionKeyword" ADD CONSTRAINT "QuestionKeyword_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "public"."Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
