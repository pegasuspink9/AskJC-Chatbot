-- DropForeignKey
ALTER TABLE "public"."Faq" DROP CONSTRAINT "Faq_department_id_fkey";

-- AlterTable
ALTER TABLE "public"."Faq" ALTER COLUMN "department_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."_DepartmentToFaq" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DepartmentToFaq_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DepartmentToFaq_B_index" ON "public"."_DepartmentToFaq"("B");

-- AddForeignKey
ALTER TABLE "public"."_DepartmentToFaq" ADD CONSTRAINT "_DepartmentToFaq_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DepartmentToFaq" ADD CONSTRAINT "_DepartmentToFaq_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;
