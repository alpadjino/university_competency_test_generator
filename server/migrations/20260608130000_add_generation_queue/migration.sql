-- CreateEnum
CREATE TYPE "generation_status" AS ENUM ('queued', 'generating', 'completed', 'failed');

-- AlterTable
ALTER TABLE "questions" ADD COLUMN "generation_status" "generation_status";

-- CreateTable
CREATE TABLE "generation_tasks" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "test_id" INTEGER NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "status" "generation_status" NOT NULL DEFAULT 'queued',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "generation_tasks_question_id_key" ON "generation_tasks"("question_id");

-- AddForeignKey
ALTER TABLE "generation_tasks" ADD CONSTRAINT "generation_tasks_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_tasks" ADD CONSTRAINT "generation_tasks_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
