-- CreateEnum
CREATE TYPE "AttemptMode" AS ENUM ('PRACTICE', 'SIMULATION');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "QuestionSource" AS ENUM ('STARTER', 'GENERATED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "targetExamId" TEXT,
    "examDate" DATE,
    "institution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "stem" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "answer" TEXT NOT NULL,
    "explanations" JSONB NOT NULL,
    "source" "QuestionSource" NOT NULL DEFAULT 'GENERATED',
    "model" TEXT,
    "contentHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "reports" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "mode" "AttemptMode" NOT NULL,
    "domainIds" TEXT[],
    "questionCount" INTEGER NOT NULL,
    "timeLimitSec" INTEGER,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "correctCount" INTEGER,
    "scorePercent" DOUBLE PRECISION,
    "passed" BOOLEAN,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptItem" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "optionOrder" TEXT NOT NULL DEFAULT 'ABCD',
    "selected" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "AttemptItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthThrottle" (
    "key" TEXT NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "AuthThrottle_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Question_contentHash_key" ON "Question"("contentHash");

-- CreateIndex
CREATE INDEX "Question_examId_domainId_active_idx" ON "Question"("examId", "domainId", "active");

-- CreateIndex
CREATE INDEX "Attempt_userId_examId_startedAt_idx" ON "Attempt"("userId", "examId", "startedAt");

-- CreateIndex
CREATE INDEX "AttemptItem_questionId_idx" ON "AttemptItem"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptItem_attemptId_position_key" ON "AttemptItem"("attemptId", "position");

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptItem" ADD CONSTRAINT "AttemptItem_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttemptItem" ADD CONSTRAINT "AttemptItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
