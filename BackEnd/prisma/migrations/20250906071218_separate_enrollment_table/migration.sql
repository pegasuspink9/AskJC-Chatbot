/*
  Warnings:

  - You are about to drop the `EnrollmentAndNavigation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."EnrollmentAndNavigation";

-- CreateTable
CREATE TABLE "public"."Enrollment" (
    "id" SERIAL NOT NULL,
    "enrollment_process" TEXT NOT NULL,
    "enrollment_documents" TEXT NOT NULL,
    "enrollee_type" TEXT NOT NULL,
    "department_to_enroll" TEXT NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);
