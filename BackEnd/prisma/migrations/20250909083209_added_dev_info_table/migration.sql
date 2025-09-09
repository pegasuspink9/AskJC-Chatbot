-- CreateTable
CREATE TABLE "public"."DevInfo" (
    "id" SERIAL NOT NULL,
    "dev_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,

    CONSTRAINT "DevInfo_pkey" PRIMARY KEY ("id")
);
