import { WeekDay } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/db.js";

interface FoodInput {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealInput {
  name: string;
  time?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: FoodInput[];
  notes?: string;
  order: number;
}

interface NutritionDayInput {
  weekDay?: WeekDay;
  order: number;
  meals: MealInput[];
}

export interface CreateNutritionPlanDTO {
  userId: string;
  goal: string;
  coverImageUrl?: string;
  notes?: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  days: NutritionDayInput[];
}

export async function createNutritionPlan(dto: CreateNutritionPlanDTO) {
  const daysWithWeekDay = dto.days.filter((d) => d.weekDay != null);
  const daysWithoutWeekDay = dto.days.filter((d) => d.weekDay == null);

  if (daysWithoutWeekDay.length > 0 && daysWithWeekDay.length > 0) {
    throw new Error("Dias inválidos: mistura de dias com e sem weekDay.");
  }

  if (daysWithoutWeekDay.length > 1) {
    throw new Error("Plano único deve ter apenas 1 dia sem weekDay.");
  }

  const weekDays = daysWithWeekDay.map((d) => d.weekDay);
  if (weekDays.length !== new Set(weekDays).size) {
    throw new Error(
      "Dias duplicados: o mesmo weekDay aparece mais de uma vez.",
    );
  }

  await prisma.nutritionPlan.updateMany({
    where: { userId: dto.userId, isActive: true },
    data: { isActive: false },
  });

  const plan = await prisma.nutritionPlan.create({
    data: {
      userId: dto.userId,
      goal: dto.goal,
      coverImageUrl: dto.coverImageUrl,
      notes: dto.notes?.trim() || undefined,
      totalCalories: dto.totalCalories,
      totalProtein: dto.totalProtein,
      totalCarbs: dto.totalCarbs,
      totalFat: dto.totalFat,
      days: {
        create: dto.days.map((day) => ({
          weekDay: day.weekDay ?? null,
          order: day.order,
          totalCalories: day.meals.reduce((s, m) => s + m.calories, 0),
          totalProtein: day.meals.reduce((s, m) => s + m.protein, 0),
          totalCarbs: day.meals.reduce((s, m) => s + m.carbs, 0),
          totalFat: day.meals.reduce((s, m) => s + m.fat, 0),
          meals: {
            create: day.meals.map((meal) => ({
              name: meal.name,
              time: meal.time?.trim(),
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
              foods: JSON.stringify(meal.foods),
              notes: meal.notes,
              order: meal.order,
            })),
          },
        })),
      },
    },
    include: {
      days: {
        orderBy: { order: "asc" },
        include: { meals: { orderBy: { order: "asc" } } },
      },
    },
  });

  return plan;
}
