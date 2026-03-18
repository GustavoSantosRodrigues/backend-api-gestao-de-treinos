import { prisma } from '../../lib/db.js'

export async function listNutritionPlans(userId: string) {
  return prisma.nutritionPlan.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      days: {
        orderBy: { order: 'asc' },
        select: {
          id:            true,
          weekDay:       true,
          order:         true,
          totalCalories: true,
          totalProtein:  true,
          totalCarbs:    true,
          totalFat:      true,
        },
      },
    },
  })
}