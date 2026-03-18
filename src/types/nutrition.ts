import { WeekDay } from '../generated/prisma/enums.js'

export { WeekDay }

export const weekDayLabel: Record<WeekDay, string> = {
  [WeekDay.MONDAY]:    'Segunda',
  [WeekDay.TUESDAY]:   'Terça',
  [WeekDay.WEDNESDAY]: 'Quarta',
  [WeekDay.THURSDAY]:  'Quinta',
  [WeekDay.FRIDAY]:    'Sexta',
  [WeekDay.SATURDAY]:  'Sábado',
  [WeekDay.SUNDAY]:    'Domingo',
}

export const JS_TO_WEEKDAY: WeekDay[] = [
  WeekDay.SUNDAY,
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
]

export interface Food {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface Meal {
  id: string
  nutritionDayId: string
  name: string
  time?: string | null
  calories: number
  protein: number
  carbs: number
  fat: number
  foods: Food[]
  notes?: string | null
  order: number
}

export interface NutritionDay {
  id: string
  nutritionPlanId: string
  weekDay: WeekDay | null
  order: number
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  meals: Meal[]
}

export interface NutritionPlan {
  id: string
  userId: string
  goal: string
  isActive: boolean
  coverImageUrl?: string | null
  notes?: string | null
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  days: NutritionDay[]
  createdAt: string
  updatedAt: string
}

export interface NutritionDayWithPlan extends NutritionDay {
  nutritionPlan: Pick<
    NutritionPlan,
    'id' | 'goal' | 'totalCalories' | 'totalProtein' | 'totalCarbs' | 'totalFat'
  >
}