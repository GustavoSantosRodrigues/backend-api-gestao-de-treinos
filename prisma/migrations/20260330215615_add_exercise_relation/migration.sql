/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Exercise` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Exercise_difficulty_idx";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "difficulty";
