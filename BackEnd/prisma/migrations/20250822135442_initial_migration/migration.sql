-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "log_in_date" TIMESTAMP(3),
    "data_inputed" TEXT NOT NULL,
    "message_sent" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Query" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chatbot_session_id" INTEGER NOT NULL,
    "query_text" TEXT,
    "users_data_inputed" TEXT[],
    "chatbot_response" TEXT[],
    "created_at" TIMESTAMP(3),

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatbotSession" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "chatbot_response" TEXT,
    "response_time" TIMESTAMP(3),
    "total_queries" INTEGER,

    CONSTRAINT "ChatbotSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" SERIAL NOT NULL,
    "query_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "resolved_issue" BOOLEAN,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "employee_name" TEXT,
    "teachers_details" TEXT,
    "office_location" TEXT,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "tuition_fee" DECIMAL(65,30),
    "head_name" TEXT,
    "description" TEXT,
    "building" TEXT,
    "floor" TEXT,
    "career_path" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Course" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "name" TEXT,
    "total_course" INTEGER,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Faq" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "question" TEXT,
    "answer" TEXT,
    "category" TEXT,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuestionKeyword" (
    "id" SERIAL NOT NULL,
    "faq_id" INTEGER NOT NULL,
    "keyword" TEXT,
    "created_at" TIMESTAMP(3),

    CONSTRAINT "QuestionKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Greeting" (
    "id" SERIAL NOT NULL,
    "message" TEXT,

    CONSTRAINT "Greeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolDetail" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "small_details" TEXT,
    "year_built" INTEGER,
    "history" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "address" TEXT,
    "accreditation" TEXT,

    CONSTRAINT "SchoolDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" SERIAL NOT NULL,
    "school_detail_id" INTEGER NOT NULL,
    "info" TEXT,
    "website" TEXT,
    "number" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SchoolFaq" (
    "id" SERIAL NOT NULL,
    "school_detail_id" INTEGER NOT NULL,
    "question" TEXT,
    "answer" TEXT,
    "category" TEXT,
    "priority" INTEGER,
    "view_count" INTEGER,
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "SchoolFaq_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Query" ADD CONSTRAINT "Query_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Query" ADD CONSTRAINT "Query_chatbot_session_id_fkey" FOREIGN KEY ("chatbot_session_id") REFERENCES "public"."ChatbotSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatbotSession" ADD CONSTRAINT "ChatbotSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "public"."Query"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Faq" ADD CONSTRAINT "Faq_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionKeyword" ADD CONSTRAINT "QuestionKeyword_faq_id_fkey" FOREIGN KEY ("faq_id") REFERENCES "public"."Faq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_school_detail_id_fkey" FOREIGN KEY ("school_detail_id") REFERENCES "public"."SchoolDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SchoolFaq" ADD CONSTRAINT "SchoolFaq_school_detail_id_fkey" FOREIGN KEY ("school_detail_id") REFERENCES "public"."SchoolDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
