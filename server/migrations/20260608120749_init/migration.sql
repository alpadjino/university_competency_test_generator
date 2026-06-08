CREATE TYPE "question_category" AS ENUM ('A', 'B', 'C');

CREATE TYPE "question_type" AS ENUM ('Closed', 'Open');

CREATE TYPE "question_subtype" AS ENUM ('One', 'Multiple', 'Matching', 'CorrectSequence', 'Addition', 'DetailedAnswer');

CREATE TYPE "test_status" AS ENUM ('in_progress', 'done');

CREATE TYPE "user_role" AS ENUM ('admin', 'moderator', 'viewer');

CREATE TABLE "competencies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "competencies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tests" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "test_status" NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "files" TEXT[],

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "test_id" INTEGER,
    "text" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "category" "question_category" NOT NULL,
    "type" "question_type" NOT NULL,
    "subtype" "question_subtype" NOT NULL,
    "standard_answer" TEXT,
    "order" INTEGER NOT NULL,
    "options" JSONB,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_options" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER,
    "text" TEXT NOT NULL,
    "is_true" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "test_competencies" (
    "test_id" INTEGER NOT NULL,
    "competency_id" INTEGER NOT NULL,

    CONSTRAINT "test_competencies_pkey" PRIMARY KEY ("test_id","competency_id")
);

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'viewer',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "competencies_name_key" ON "competencies"("name");

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "test_competencies" ADD CONSTRAINT "test_competencies_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "test_competencies" ADD CONSTRAINT "test_competencies_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
