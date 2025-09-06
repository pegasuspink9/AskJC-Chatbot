-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "semester" TEXT,
ADD COLUMN     "year_level" TEXT,
ALTER COLUMN "course_code" DROP NOT NULL,
ALTER COLUMN "units" DROP NOT NULL;
