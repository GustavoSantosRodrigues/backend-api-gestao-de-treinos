/*
  Warnings:

  - You are about to drop the column `note` on the `WorkoutExercise` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "note",
ADD COLUMN     "notes" TEXT;
