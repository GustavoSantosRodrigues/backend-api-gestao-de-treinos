-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "exerciseId" TEXT;

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "muscles" TEXT[],
    "equipment" TEXT,
    "difficulty" TEXT,
    "gifUrl" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
