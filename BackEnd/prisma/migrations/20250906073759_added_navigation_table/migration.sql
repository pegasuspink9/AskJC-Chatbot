-- CreateTable
CREATE TABLE "public"."Navigation" (
    "id" SERIAL NOT NULL,
    "nav_button" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "notes" TEXT NOT NULL,

    CONSTRAINT "Navigation_pkey" PRIMARY KEY ("id")
);
