-- AlterTable
ALTER TABLE "public"."Program" ALTER COLUMN "tuition_fee" DROP NOT NULL,
ALTER COLUMN "tuition_fee" SET DATA TYPE TEXT;
