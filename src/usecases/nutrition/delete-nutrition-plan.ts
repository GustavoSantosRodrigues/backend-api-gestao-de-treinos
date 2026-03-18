import { prisma } from '../../lib/db.js'

export async function deleteNutritionPlan(planId: string, userId: string) {
  await prisma.nutritionPlan.deleteMany({
    where: { id: planId, userId },
  })
}