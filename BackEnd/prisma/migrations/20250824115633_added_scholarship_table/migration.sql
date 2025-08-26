-- CreateTable
CREATE TABLE "public"."Scholarship" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "offeredBy" TEXT NOT NULL,
    "eligibility_criteria" TEXT NOT NULL,
    "application_process" TEXT NOT NULL,
    "required_document" TEXT NOT NULL,
    "award_amount" TEXT NOT NULL,
    "contact_office" TEXT NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FaqToScholarship" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FaqToScholarship_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FaqToScholarship_B_index" ON "public"."_FaqToScholarship"("B");

-- AddForeignKey
ALTER TABLE "public"."_FaqToScholarship" ADD CONSTRAINT "_FaqToScholarship_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Faq"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FaqToScholarship" ADD CONSTRAINT "_FaqToScholarship_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
