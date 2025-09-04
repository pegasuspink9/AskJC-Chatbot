/*
  Warnings:

  - You are about to drop the `Faq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Greeting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionKeyword` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SchoolFaq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ContactToFaq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DepartmentToFaq` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FaqToScholarship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FaqToStudentOrg` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."QuestionKeyword" DROP CONSTRAINT "QuestionKeyword_faq_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."SchoolFaq" DROP CONSTRAINT "SchoolFaq_school_detail_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContactToFaq" DROP CONSTRAINT "_ContactToFaq_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ContactToFaq" DROP CONSTRAINT "_ContactToFaq_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DepartmentToFaq" DROP CONSTRAINT "_DepartmentToFaq_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_DepartmentToFaq" DROP CONSTRAINT "_DepartmentToFaq_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FaqToScholarship" DROP CONSTRAINT "_FaqToScholarship_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FaqToScholarship" DROP CONSTRAINT "_FaqToScholarship_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FaqToStudentOrg" DROP CONSTRAINT "_FaqToStudentOrg_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FaqToStudentOrg" DROP CONSTRAINT "_FaqToStudentOrg_B_fkey";

-- DropTable
DROP TABLE "public"."Faq";

-- DropTable
DROP TABLE "public"."Greeting";

-- DropTable
DROP TABLE "public"."QuestionKeyword";

-- DropTable
DROP TABLE "public"."SchoolFaq";

-- DropTable
DROP TABLE "public"."_ContactToFaq";

-- DropTable
DROP TABLE "public"."_DepartmentToFaq";

-- DropTable
DROP TABLE "public"."_FaqToScholarship";

-- DropTable
DROP TABLE "public"."_FaqToStudentOrg";
