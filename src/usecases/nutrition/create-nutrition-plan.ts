import { WeekDay } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/db.js";
import { validateNutritionDays } from "./validate-nutrition-days.js";
import { calculatePlanAverages } from "./calculate-plan-averages.js";

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
  notes?: string;
  days: NutritionDayInput[];
}

export async function createNutritionPlan(dto: CreateNutritionPlanDTO) {
  validateNutritionDays(dto.days);

  const { totalCalories, totalProtein, totalCarbs, totalFat } =
    calculatePlanAverages(dto.days);

  await prisma.nutritionPlan.updateMany({
    where: { userId: dto.userId, isActive: true },
    data: { isActive: false },
  });

  return prisma.nutritionPlan.create({
    data: {
      userId: dto.userId,
      goal: dto.goal.trim(),
      notes: dto.notes?.trim() || null,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
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
              name: meal.name.trim(),
              time: meal.time?.trim() || null,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fat,
              notes: meal.notes?.trim() || null,
              order: meal.order,
              foods: JSON.stringify(
                meal.foods.map((f) => ({
                  ...f,
                  name: f.name.trim(),
                  unit: f.unit.trim(),
                })),
              ),
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
}
