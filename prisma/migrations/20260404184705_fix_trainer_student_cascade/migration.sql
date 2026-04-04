-- DropForeignKey
ALTER TABLE "TrainerStudent" DROP CONSTRAINT "TrainerStudent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TrainerStudent" DROP CONSTRAINT "TrainerStudent_trainerId_fkey";

-- AddForeignKey
ALTER TABLE "TrainerStudent" ADD CONSTRAINT "TrainerStudent_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerStudent" ADD CONSTRAINT "TrainerStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
