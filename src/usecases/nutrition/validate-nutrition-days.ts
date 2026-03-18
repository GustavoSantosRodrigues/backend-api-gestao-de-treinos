import { WeekDay } from '../../generated/prisma/enums.js'

interface FoodInput {
  name: string
  unit: string
  quantity: number
}

interface MealInput {
  order: number
  foods: FoodInput[]
}

interface DayInput {
  weekDay?: WeekDay
  order: number
  meals: MealInput[]
}

function isSequential(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted.every((value, index) => value === index + 1)
}

export function validateNutritionDays(days: DayInput[]): void {
  if (days.length === 0) {
    throw new Error('O plano deve ter pelo menos 1 dia.')
  }

  const daysWithWeekDay    = days.filter((d) => d.weekDay != null)
  const daysWithoutWeekDay = days.filter((d) => d.weekDay == null)

  if (daysWithoutWeekDay.length > 0 && daysWithWeekDay.length > 0) {
    throw new Error('Dias inválidos: mistura de dias com e sem weekDay.')
  }

  if (daysWithoutWeekDay.length > 0 && days.length !== 1) {
    throw new Error('Plano único deve ter exatamente 1 dia sem weekDay.')
  }

  if (daysWithoutWeekDay.length === 1 && days[0].order !== 1) {
    throw new Error('Plano único deve ter order 1.')
  }

  const weekDays = daysWithWeekDay.map((d) => d.weekDay)
  if (weekDays.length !== new Set(weekDays).size) {
    throw new Error('Dias duplicados: o mesmo weekDay aparece mais de uma vez.')
  }

  const dayOrders = days.map((d) => d.order)
  if (dayOrders.length !== new Set(dayOrders).size) {
    throw new Error('Order duplicado nos dias.')
  }

  if (!isSequential(dayOrders)) {
    throw new Error('Order dos dias deve ser sequencial começando em 1.')
  }

  for (const day of days) {
    const label = day.weekDay ?? 'único'

    if (day.meals.length === 0) {
      throw new Error(`O dia ${label} deve ter pelo menos 1 refeição.`)
    }

    const mealOrders = day.meals.map((m) => m.order)
    if (mealOrders.length !== new Set(mealOrders).size) {
      throw new Error(`Order duplicado nas refeições do dia ${label}.`)
    }

    if (!isSequential(mealOrders)) {
      throw new Error(`Order das refeições do dia ${label} deve ser sequencial começando em 1.`)
    }

    for (const meal of day.meals) {
      if (meal.foods.length === 0) {
        throw new Error(`A refeição ${meal.order} do dia ${label} deve ter pelo menos 1 alimento.`)
      }

      for (const food of meal.foods) {
        if (!food.name.trim()) throw new Error('Nome do alimento é obrigatório.')
        if (!food.unit.trim()) throw new Error('Unidade do alimento é obrigatória.')
        if (food.quantity <= 0) throw new Error('Quantidade do alimento deve ser maior que zero.')
      }
    }
  }
}