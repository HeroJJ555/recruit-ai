-- CreateTable
CREATE TABLE "CandidateApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "education" TEXT,
    "cvFileName" TEXT NOT NULL,
    "cvFileType" TEXT NOT NULL,
    "cvFileSize" INTEGER NOT NULL,
    "cvFileData" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateApplication_email_idx" ON "CandidateApplication"("email");

-- CreateIndex
CREATE INDEX "CandidateApplication_createdAt_idx" ON "CandidateApplication"("createdAt");

-- CreateIndex
CREATE INDEX "CandidateApplication_position_idx" ON "CandidateApplication"("position");

-- AddForeignKey
ALTER TABLE "CandidateApplication" ADD CONSTRAINT "CandidateApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
