/*
  Warnings:

  - Made the column `name` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `equipment` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `difficulty` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gifUrl` on table `Exercise` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "equipment" SET NOT NULL,
ALTER COLUMN "difficulty" SET NOT NULL,
ALTER COLUMN "gifUrl" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Exercise_equipment_idx" ON "Exercise"("equipment");

-- CreateIndex
CREATE INDEX "Exercise_difficulty_idx" ON "Exercise"("difficulty");
