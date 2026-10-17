-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('TEXT', 'IMAGE', 'AUDIO', 'GAP_SELECT', 'GAP_INPUT', 'SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE', 'MATCH_PAIRS', 'ORDER_WORDS');

-- CreateEnum
CREATE TYPE "LiveSessionStatus" AS ENUM ('ACTIVE', 'ENDED');

-- CreateEnum
CREATE TYPE "AttemptKind" AS ENUM ('PRACTICE', 'LIVE', 'HOMEWORK');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'AUDIO');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
    "passwordChangedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherStudent" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" UUID NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "teacherId" UUID NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "usedById" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" UUID NOT NULL,
    "lessonId" UUID NOT NULL,
    "type" "BlockType" NOT NULL,
    "position" INTEGER NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "content" JSONB NOT NULL,
    "answerKey" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonSnapshot" (
    "id" UUID NOT NULL,
    "lessonId" UUID,
    "lessonVersion" INTEGER NOT NULL,
    "blocks" JSONB NOT NULL,
    "answerKeys" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSession" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "snapshotId" UUID NOT NULL,
    "status" "LiveSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "followMode" BOOLEAN NOT NULL DEFAULT false,
    "currentBlockId" TEXT,
    "lockedBlockIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "seq" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMPTZ(3),

    CONSTRAINT "LiveSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSessionParticipant" (
    "id" UUID NOT NULL,
    "liveSessionId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "joinedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "snapshotId" UUID NOT NULL,
    "kind" "AttemptKind" NOT NULL,
    "liveSessionId" UUID,
    "homeworkId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAnswer" (
    "id" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "blockId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "resetAt" TIMESTAMPTZ(3),

    CONSTRAINT "StudentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "snapshotId" UUID NOT NULL,
    "dueAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Homework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeworkSubmission" (
    "id" UUID NOT NULL,
    "homeworkId" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "submittedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(3),
    "grade" INTEGER,
    "score" INTEGER,

    CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "authorId" UUID NOT NULL,
    "submissionId" UUID NOT NULL,
    "blockId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuthSession_userId_createdAt_idx" ON "AuthSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AuthSession_expiresAt_idx" ON "AuthSession"("expiresAt");

-- CreateIndex
CREATE INDEX "TeacherStudent_studentId_idx" ON "TeacherStudent"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherStudent_teacherId_studentId_key" ON "TeacherStudent"("teacherId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_tokenHash_key" ON "Invite"("tokenHash");

-- CreateIndex
CREATE INDEX "Invite_teacherId_createdAt_idx" ON "Invite"("teacherId", "createdAt");

-- CreateIndex
CREATE INDEX "Invite_usedById_idx" ON "Invite"("usedById");

-- CreateIndex
CREATE INDEX "Course_ownerId_position_idx" ON "Course"("ownerId", "position");

-- CreateIndex
CREATE INDEX "Lesson_courseId_position_idx" ON "Lesson"("courseId", "position");

-- CreateIndex
CREATE INDEX "Block_lessonId_position_idx" ON "Block"("lessonId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "LessonSnapshot_lessonId_lessonVersion_key" ON "LessonSnapshot"("lessonId", "lessonVersion");

-- CreateIndex
CREATE INDEX "LiveSession_teacherId_startedAt_idx" ON "LiveSession"("teacherId", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "LiveSession_snapshotId_idx" ON "LiveSession"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSession_id_snapshotId_key" ON "LiveSession"("id", "snapshotId");

-- CreateIndex
CREATE INDEX "LiveSessionParticipant_studentId_idx" ON "LiveSessionParticipant"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "LiveSessionParticipant_liveSessionId_studentId_key" ON "LiveSessionParticipant"("liveSessionId", "studentId");

-- CreateIndex
CREATE INDEX "Attempt_studentId_kind_createdAt_idx" ON "Attempt"("studentId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "Attempt_snapshotId_idx" ON "Attempt"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_liveSessionId_studentId_key" ON "Attempt"("liveSessionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_homeworkId_studentId_key" ON "Attempt"("homeworkId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_id_homeworkId_key" ON "Attempt"("id", "homeworkId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAnswer_attemptId_blockId_itemId_key" ON "StudentAnswer"("attemptId", "blockId", "itemId");

-- CreateIndex
CREATE INDEX "Homework_studentId_dueAt_idx" ON "Homework"("studentId", "dueAt");

-- CreateIndex
CREATE INDEX "Homework_teacherId_dueAt_idx" ON "Homework"("teacherId", "dueAt");

-- CreateIndex
CREATE INDEX "Homework_snapshotId_idx" ON "Homework"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "Homework_id_snapshotId_studentId_key" ON "Homework"("id", "snapshotId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_homeworkId_key" ON "HomeworkSubmission"("homeworkId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeworkSubmission_attemptId_homeworkId_key" ON "HomeworkSubmission"("attemptId", "homeworkId");

-- CreateIndex
CREATE INDEX "Comment_submissionId_createdAt_idx" ON "Comment"("submissionId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "MediaFile_storageKey_key" ON "MediaFile"("storageKey");

-- CreateIndex
CREATE INDEX "MediaFile_ownerId_createdAt_idx" ON "MediaFile"("ownerId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudent" ADD CONSTRAINT "TeacherStudent_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherStudent" ADD CONSTRAINT "TeacherStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_usedById_fkey" FOREIGN KEY ("usedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSnapshot" ADD CONSTRAINT "LessonSnapshot_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSession" ADD CONSTRAINT "LiveSession_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "LessonSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionParticipant" ADD CONSTRAINT "LiveSessionParticipant_liveSessionId_fkey" FOREIGN KEY ("liveSessionId") REFERENCES "LiveSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSessionParticipant" ADD CONSTRAINT "LiveSessionParticipant_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "LessonSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_liveSessionId_snapshotId_fkey" FOREIGN KEY ("liveSessionId", "snapshotId") REFERENCES "LiveSession"("id", "snapshotId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_liveSessionId_studentId_fkey" FOREIGN KEY ("liveSessionId", "studentId") REFERENCES "LiveSessionParticipant"("liveSessionId", "studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_homeworkId_snapshotId_studentId_fkey" FOREIGN KEY ("homeworkId", "snapshotId", "studentId") REFERENCES "Homework"("id", "snapshotId", "studentId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAnswer" ADD CONSTRAINT "StudentAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "LessonSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES "Homework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_attemptId_homeworkId_fkey" FOREIGN KEY ("attemptId", "homeworkId") REFERENCES "Attempt"("id", "homeworkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "HomeworkSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaFile" ADD CONSTRAINT "MediaFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- ─── Ограничения, которые Prisma не выражает в schema.prisma ───────────────

-- Email хранится нормализованным: уникальность без учёта регистра и пробелов.
ALTER TABLE "User" ADD CONSTRAINT "User_email_normalized_check" CHECK ("email" = lower(btrim("email")));

-- Учитель не может быть своим учеником.
ALTER TABLE "TeacherStudent" ADD CONSTRAINT "TeacherStudent_not_self_check" CHECK ("teacherId" <> "studentId");

-- Приглашение использовано тем, кто его погасил: usedById без usedAt невозможен.
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_used_check" CHECK ("usedById" IS NULL OR "usedAt" IS NOT NULL);

-- Оптимистичная блокировка: версия урока начинается с 1.
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_version_check" CHECK ("version" >= 1);

-- Список заблокированных блоков класса всегда есть (пустой массив по умолчанию).
ALTER TABLE "LiveSession" ALTER COLUMN "lockedBlockIds" SET NOT NULL;

-- Вид попытки согласован со ссылками: практика — без ссылок, класс — только класс, ДЗ — только ДЗ.
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_kind_link_check" CHECK (
  ("kind" = 'PRACTICE' AND "liveSessionId" IS NULL AND "homeworkId" IS NULL) OR
  ("kind" = 'LIVE' AND "liveSessionId" IS NOT NULL AND "homeworkId" IS NULL) OR
  ("kind" = 'HOMEWORK' AND "homeworkId" IS NOT NULL AND "liveSessionId" IS NULL)
);

-- Оценка 2–5, процент верных ответов 0–100.
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_grade_check" CHECK ("grade" BETWEEN 2 AND 5);
ALTER TABLE "HomeworkSubmission" ADD CONSTRAINT "HomeworkSubmission_score_check" CHECK ("score" BETWEEN 0 AND 100);

-- Снимок урока неизменяем: проверка ответов по нему должна быть воспроизводимой.
-- Разрешено только обнулить lessonId (ON DELETE SET NULL при удалении урока).
CREATE FUNCTION "lesson_snapshot_immutable"() RETURNS trigger
  LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  RAISE EXCEPTION 'LessonSnapshot is immutable';
END;
$$;

-- Триггер срабатывает только на изменение содержимого: каскадное SET NULL меняет
-- одну колонку lessonId и не вызывает сравнения больших jsonb.
CREATE TRIGGER "LessonSnapshot_immutable"
  BEFORE UPDATE OF "id", "lessonVersion", "blocks", "answerKeys", "createdAt" ON "LessonSnapshot"
  FOR EACH ROW EXECUTE FUNCTION "lesson_snapshot_immutable"();

CREATE TRIGGER "LessonSnapshot_no_relink"
  BEFORE UPDATE OF "lessonId" ON "LessonSnapshot"
  FOR EACH ROW WHEN (NEW."lessonId" IS NOT NULL)
  EXECUTE FUNCTION "lesson_snapshot_immutable"();

-- У учителя не больше одного активного класса.
CREATE UNIQUE INDEX "LiveSession_teacherId_active_key" ON "LiveSession"("teacherId") WHERE "status" = 'ACTIVE';
