interface MealMacros {
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DayWithMeals {
  meals: MealMacros[]
}

export function calculatePlanAverages(days: DayWithMeals[]) {
  const totals = days.reduce(
    (acc, day) => {
      const dayTotals = day.meals.reduce(
        (mealAcc, meal) => {
          mealAcc.calories += meal.calories
          mealAcc.protein  += meal.protein
          mealAcc.carbs    += meal.carbs
          mealAcc.fat      += meal.fat
          return mealAcc
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      )
      acc.calories += dayTotals.calories
      acc.protein  += dayTotals.protein
      acc.carbs    += dayTotals.carbs
      acc.fat      += dayTotals.fat
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  )

  return {
    totalCalories: Math.round(totals.calories / days.length),
    totalProtein:  Math.round(totals.protein  / days.length),
    totalCarbs:    Math.round(totals.carbs    / days.length),
    totalFat:      Math.round(totals.fat      / days.length),
  }
}