-- CreateTable
CREATE TABLE "public"."OfficeImage" (
    "id" SERIAL NOT NULL,
    "image_url" TEXT NOT NULL,
    "office_id" INTEGER NOT NULL,

    CONSTRAINT "OfficeImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficeImage_office_id_key" ON "public"."OfficeImage"("office_id");

-- AddForeignKey
ALTER TABLE "public"."OfficeImage" ADD CONSTRAINT "OfficeImage_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "public"."Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
