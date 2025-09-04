-- DropForeignKey
ALTER TABLE "public"."Program" DROP CONSTRAINT "Program_department_id_fkey";

-- AlterTable
ALTER TABLE "public"."Program" ALTER COLUMN "department_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Program" ADD CONSTRAINT "Program_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
