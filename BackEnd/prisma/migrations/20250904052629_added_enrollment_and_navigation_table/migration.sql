-- CreateTable
CREATE TABLE "public"."EnrollmentAndNavigation" (
    "id" SERIAL NOT NULL,
    "enrollment_process" TEXT NOT NULL,
    "navigation" TEXT NOT NULL,

    CONSTRAINT "EnrollmentAndNavigation_pkey" PRIMARY KEY ("id")
);
