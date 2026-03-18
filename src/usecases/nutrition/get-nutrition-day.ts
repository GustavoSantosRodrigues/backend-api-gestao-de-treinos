import { prisma } from '../../lib/db.js'
import { Food } from '../../types/nutrition.js'

export async function getNutritionDay(dayId: string, userId: string) {
  const day = await prisma.nutritionDay.findFirst({
    where: {
      id:            dayId,
      nutritionPlan: { userId },
    },
    include: {
      nutritionPlan: {
        select: {
          id:            true,
          goal:          true,
          totalCalories: true,
          totalProtein:  true,
          totalCarbs:    true,
          totalFat:      true,
        },
      },
      meals: { orderBy: { order: 'asc' } },
    },
  })

  if (!day) return null

  return {
    ...day,
    meals: day.meals.map((meal) => ({
      ...meal,
      foods: JSON.parse(meal.foods) as Food[],
    })),
  }
}