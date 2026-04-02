/*
  Warnings:

  - You are about to drop the column `equipment` on the `Exercise` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Exercise_equipment_idx";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "equipment";
