-- AlterTable
ALTER TABLE "user" ADD COLUMN     "isTrainer" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TrainerStudent" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrainerStudent_trainerId_studentId_key" ON "TrainerStudent"("trainerId", "studentId");

-- AddForeignKey
ALTER TABLE "TrainerStudent" ADD CONSTRAINT "TrainerStudent_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerStudent" ADD CONSTRAINT "TrainerStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
