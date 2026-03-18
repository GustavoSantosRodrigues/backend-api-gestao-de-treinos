import { prisma } from '../../lib/db.js'

export async function getNutritionPlan(planId: string, userId: string) {
  const plan = await prisma.nutritionPlan.findFirst({
    where: { id: planId, userId },
    include: {
      days: {
        orderBy: { order: 'asc' },
        include: { meals: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!plan) return null

  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => ({
        ...meal,
        foods: JSON.parse(meal.foods) as import('../../types/nutrition.js').Food[],
      })),
    })),
  }
}